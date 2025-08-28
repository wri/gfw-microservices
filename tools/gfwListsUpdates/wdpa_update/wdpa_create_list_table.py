import pyodbc
import pandas as pd
import geopandas as gpd
import fiona
import wdpa_config as cfg
from concurrent.futures import ThreadPoolExecutor


def prep_data(gdf, globalid_df_expanded):
    """
    Perform required data transformations
    """
    # Join with GlobalID.
    gdf = gdf.merge(globalid_df_expanded, how="left", left_on="WDPA_PID", right_on="wdpa_pid")

    # Rename cols to match schema
    rename_dict = {
        "NAME": "Location Name",
        "IUCN_CAT": "IUCN CAT",
        "DESIG_TYPE": "Designation Type",
        "DESIG_ENG": "Designation",
        "gfw_geostore_id": "globalid",
    }
    gdf = gdf.rename(columns=rename_dict)

    # Generate other required columns
    gdf["id"] = gdf["location_id"]
    gdf["Location Classification"] = ""
    
    # Use approximate centroid (minx+maxx)/2, (miny+maxy)/2
    bounds = gdf.geometry.bounds
    gdf["Longitude"] = (bounds.minx + bounds.maxx) / 2
    gdf["Latitude"] = (bounds.miny + bounds.maxy) / 2
    
    # Convert from km^2 to hectares by multiplying by 100
    gdf["Size"] = (gdf["GIS_AREA"] * 100).round(6)

    # Validate geometry
    if not gdf.is_valid.all():
        gdf.loc[~gdf.is_valid, "geometry"] = gdf.loc[~gdf.is_valid, "geometry"].buffer(0)

    gdf["Geometry"] = gdf["geometry"].apply(lambda geom: geom.wkt)

    # Remove NULL values
    gdf = gdf[gdf["globalid"].notna() & gdf["wdpa_pid"].notna()]

    return gdf


def insert_geom(gdf, connection):
    """
    Large list processing - insert new locations into locations table
    """

    table_name = "list-protectedAreas_import"
    columns = [
        "Location Name",
        "Latitude",
        "Longitude",
        "Country",
        "State",
        "Sub State",
        "Size",
        "IUCN CAT",
        "Designation Type",
        "Designation",
        "Location Classification",
        "gadmid",
        "globalid",
        "location_id",
        "id",
        "Geometry",
    ]

    # select columns to keep (Geometry should be last in the list)
    common_columns = list(
        gdf.columns.intersection(set(columns))
    )
    # move Geometry to the end of the list
    common_columns.sort(key="Geometry".__eq__)

    try:       
        new_locations = list(gdf[common_columns].itertuples(index=False, name=None))

        with connection:
            cursor = connection.cursor()
            cursor.fast_executemany = True
            column_name_string = ",".join([f'"{x}"' for x in common_columns])
            # '?' per attribute minus 1 for geometry (special case)
            value_marks = ",".join(["?" for x in common_columns[:-1]])
            value_marks = value_marks + "," + "geometry::STGeomFromText(?, 4326)"

            sql = f"INSERT INTO [dbo].[{table_name}] ({column_name_string}) VALUES ({value_marks})"
            inputSizes = [None for c in common_columns[:-1]]
            inputSizes.append((pyodbc.SQL_WVARCHAR, 0, 0))
            cursor.setinputsizes(inputSizes)
            cursor.executemany(sql, new_locations)

        return []
    except Exception as e:
        # Return list of failed locations
        return [e]  


def load_list(in_path, in_layer, start, end, connection, globalid_df_expanded):
    """
    Loads and preps the geodataframe
    """
    gdf = gpd.read_file(in_path, driver="FileGDB", layer=in_layer, rows=slice(start, end))

    gdf = prep_data(gdf, globalid_df_expanded)
    e = insert_geom(gdf, connection)

    if len(e) > 0:
        print(e)
        return True, gdf
    else:
        return False, None


if __name__ == "__main__":
    """This is executed when run from the command line"""
    in_gdb = cfg.fgdb_path
    in_layer = cfg.layer_name

    print("Connecting to DB")
    connection = pyodbc.connect(cfg.conn_string)
    print("Connected to DB")

    # Load GlobalID JSON once globally
    globalid_df = pd.read_json(cfg.json_path)
    globalid_df_expanded = pd.json_normalize(globalid_df["data"])

    # Use Fiona to get the total number of features in the layer
    with fiona.open(in_gdb, layer=in_layer, driver="FileGDB") as src:
        total_rows = len(src)

    print(f"Total rows in the FileGDB: {total_rows}")

    # Iteratively load data to DB in parallel
    error_ls = []
    batch_size = 10000

    def process_batch(i):
        end_val = min(i + batch_size, total_rows)
        print(f"Loading {i} to {end_val}")
        
        # Open a new connection for this batch
        with pyodbc.connect(cfg.conn_string) as conn:
            res, df = load_list(
                in_gdb,
                in_layer,
                i,
                end_val,
                conn,
                globalid_df_expanded,
            )
        return res

    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(process_batch, i) for i in range(0, total_rows, batch_size)]
        for future in futures:
            res = future.result()
            if res:
                break
