import pyodbc
import pandas as pd
import geopandas as gpd
import fiona
import wdpa_config as cfg


def prep_data(gdf):
    """
    Perform required data transformations
    """
    # Join with GlobalID.
    globalid_df = pd.read_json(cfg.json_path)
    globalid_df_expanded = pd.json_normalize(globalid_df["data"])
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
    gdf["Longitude"] = gdf.centroid.x
    gdf["Latitude"] = gdf.centroid.y
    gdf["Location Classification"] = ""
    
    # Convert from km^2 to hectares by multiplying by 100
    gdf["Size"] = (gdf["GIS_AREA"] * 100).round(6)

    # Validate geometry then convert to WKT.
    gdf.geometry = gdf.buffer(0)
    gdf["Geometry"] = gdf.geometry.to_wkt(output_dimension=2)

    # Remove NULL values
    gdf = gdf[gdf["globalid"].notna()]
    gdf = gdf[gdf["wdpa_pid"].notna()]

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

    try:       
        # select columns to keep (Geometry should be last in the list)
        common_columns = list(
            gdf.columns.intersection(set(columns))
        )
        # move Geometry to the end of the list
        # https://stackoverflow.com/questions/20320702/how-do-i-move-an-element-in-my-list-to-the-end-in-python
        common_columns.sort(key="Geometry".__eq__)

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


def load_list(in_path, in_layer, start, end, connection):
    """
    Loads and preps the geodataframe
    """
    gdf = gpd.read_file(in_path, driver="FileGDB", layer=in_layer, rows=slice(start, end))

    gdf = prep_data(gdf)
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

    # Use Fiona to get the total number of features in the layer
    with fiona.open(in_gdb, layer=in_layer, driver="FileGDB") as src:
        total_rows = len(src)

    print(f"Total rows in the FileGDB: {total_rows}")

    # Iteratively load data to DB
    error_ls = []
    batch_size = 5000
    for i in range(0, total_rows, batch_size):
        end_val = min(i + batch_size, total_rows)

        print(f"Loading {i} to {end_val}")
        res, df = load_list(
            in_gdb,
            in_layer,
            i,
            end_val,
            connection,
        )

        # Halt on error
        if res:
            break
