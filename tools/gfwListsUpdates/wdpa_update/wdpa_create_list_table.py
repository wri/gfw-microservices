import pyodbc
import pandas as pd
import geopandas as gpd
import wdpa_config as cfg

def join_globalid(gdf):
    """
    Join globalid data
    """
    df = pd.read_json(cfg.json_path)
    df_expanded = pd.json_normalize(df["data"])

    gdf = gdf.merge(df_expanded, how="left", left_on="WDPA_PID", right_on="wdpa_pid")

    return gdf

def wdpa_renameColumns(gdf):
    """
    Rename columns in a dataframe
    """
    # DB col names dict
    rename_dict = {
        "NAME": "Location Name",
        "GIS_AREA": "Size",
        "IUCN_CAT": "IUCN CAT",
        "DESIG_TYPE": "Designation Type",
        "DESIG_ENG": "Designation",
        "name_0": "Country",
        "name_1": "State",
        "name_2": "Sub State",
        "gfw_geostore_id": "globalid",
    }

    gdf = gdf.rename(columns=rename_dict)
    gdf["id"] = gdf["location_id"]

    # get centroid
    gdf["Longitude"] = gdf.centroid.x
    gdf["Latitude"] = gdf.centroid.y

    # df["Geometry"] = df.geometry.to_wkt(
    #     output_dimension=2
    # )
    gdf["Location Classification"] = ""

    return gdf

def insert_geometry_WDPA(gdf, connection):
    """
    Large list processing - insert new locations into locations table
    """

    table_name = "list-protectedAreas_import"
    analysis_table_name = "analysis-protectedAreas_import"
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
        "WDPAID",
        "WDPA_PID",
        "Geometry",
    ]

    locations_objectid_list = gdf["id"].tolist()

    gdf.geometry = gdf.buffer(0)

    try:
        gdf["Geometry"] = gdf.geometry.to_wkt(
            output_dimension=2
        )  # convert geometry to wkt (2D)

        # select columns to keep (Geometry should be last in the list)
        common_columns = list(
            gdf.columns.intersection(set(columns))
        )  # selects columns that are in the list provided
        common_columns.sort(
            key="Geometry".__eq__
        )  # https://stackoverflow.com/questions/20320702/how-do-i-move-an-element-in-my-list-to-the-end-in-python
        new_locations = list(gdf[common_columns].itertuples(index=False, name=None))

        with connection:
            cursor = connection.cursor()
            cursor.fast_executemany = True
            column_name_string = ",".join([f'"{x}"' for x in common_columns])
            value_marks = ",".join(
                [f"?" for x in common_columns[:-1]]
            )  # ? per attribute minus 1 for geometry (special case)

            value_marks = value_marks + "," + "geometry::STGeomFromText(?, 4326)"
            sql = f"INSERT into [dbo].[{table_name}] ({column_name_string}) VALUES ({value_marks})"
            inputSizes = [None for c in common_columns[:-1]]
            inputSizes.append((pyodbc.SQL_WVARCHAR, 0, 0))
            cursor.setinputsizes(inputSizes)
            cursor.executemany(sql, new_locations)

        # # insert location_ids into analysis table
        # gdf["location_status_id"] = 1
        # columns = ["location_id", "location_status_id"]
        # t = list(gdf[columns].itertuples(index=False, name=None))

        # with connection:
        #     cursor = connection.cursor()
        #     cursor.fast_executemany = True
        #     column_name_string = ",".join([f'"{x}"' for x in columns])
        #     value_marks = ",".join([f"?" for x in columns])
        #     sql = f"INSERT into [dbo].[{analysis_table_name}] ({column_name_string}) VALUES ({value_marks})"
        #     cursor.executemany(sql, t)

        # print(f"Adding {len(t)} empty rows to {analysis_table_name} finished")

        return []
    except Exception as e:
        print(e)
        return locations_objectid_list  # return list of failed locations

def loadGFWList(path, start, end, connection):
    """
    Loads and preps the geodataframe
    """
    gdf = gpd.read_file(path, driver="FileGDB", layer=0, rows=slice(start, end))
    gdf = join_globalid(gdf)
    gdf = wdpa_renameColumns(gdf)
    e = insert_geometry_WDPA(gdf, connection)

    return e

if __name__ == "__main__":
    """This is executed when run from the command line"""
    print("Connecting to DB")
    connection = pyodbc.connect(cfg.conn_string)
    print("Connected to DB")

    # Iteratively load data to DB
    failed = []
    batch_size = 1000
    for i in range(0, 300000, batch_size):
        print(f"Loading {i} to {i+batch_size}")
        try:
            e = loadGFWList(cfg.fgdb_path, i, i + batch_size, connection)
            if len(e) > 0:
                failed.extend(e)
                print(f"Failed {len(e)}")
        except Exception as e:
            print(e)