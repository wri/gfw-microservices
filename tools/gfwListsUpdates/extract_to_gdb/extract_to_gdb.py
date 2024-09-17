import os
import pyodbc
import pandas as pd
import geopandas as gpd
import gdb_config as cfg
from pathlib import Path

def main(connection, list_number):
    """
    Get data from DB.
    """
    if list_number == 2:
        sql = cfg.oilPalmConcessions_sql
    elif list_number == 3:
        sql = cfg.palmOilMills_sql
    elif list_number == 5:
        sql = cfg.rspoOilPalmConcessions_sql

    df = pd.read_sql(sql, connection)
    df["list_id"] = list_number

    gdf = gpd.GeoDataFrame(df, geometry=gpd.GeoSeries.from_wkb(df["Geom"]))
    gdf = gdf.drop("Geom", axis=1)

    return gdf

if __name__ == "__main__":
    print("Connecting to DB")
    conn = pyodbc.connect(cfg.conn_string)
    print("Connected to DB")

    data_dir = Path(__file__).parent / "data"
    list_dict = {
        2 : "list-oilPalmConcessions",
        3 : "list-palmOilMills",
        5 : "list-rspoOilPalmConcessions"
        }
    for list_no, list_name in list_dict.items():
        out_dir = data_dir / list_name
        os.mkdir(out_dir)
        out_gdf = main(conn, list_no)
        out_gdf.to_file(out_dir / f"{list_name}.shp")
        
        print(f"Created shapefile for {list_name}")
    print("Done")