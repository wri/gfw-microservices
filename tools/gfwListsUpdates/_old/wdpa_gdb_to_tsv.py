import os
import pandas as pd
import geopandas as gpd
from pathlib import Path
import wdpa_config as cfg

def renameColumns(df):
    """
    Rename columns in a dataframe
    :param df: input dataframe
    :param rename_dict: dictionary of old column name to new column name
    :return: dataframe with renamed columns
    """

    # rename columns
    rename_dict = {
        "WDPA_PID": "id",
        "NAME": "Location Name",
        "GIS_AREA": "Size",
        "IUCN_CAT": "IUCN CAT",
        "DESIG_TYPE": "Designation Type",
        "DESIG_ENG": "Designation",
        "name_0": "Country",
        "name_1": "State",
        "name_2": "Sub State",
    }

    df = df.rename(columns=rename_dict)
    df["location_id"] = df["id"]  # also use wdpa_pid as location_id

    # get centroid
    df["Longitude"] = df.centroid.x
    df["Latitude"] = df.centroid.y

    df["Geometry"] = df.geometry.to_wkt(output_dimension=2)
    df["Location Classification"] = ""
    df["globalid"] = ""  # Unique ID stored in GFW Data API

    return df


def geostoreLookup(wdpa_df):
    geostore_path = r"wdpa_gfw_fid.csv"
    geostore_df = pd.read_csv(geostore_path)

    wdpa_df = wdpa_df.merge(geostore_df, left_on="id", right_on="wdpa_pid", how="left")

    wdpa_df["globalid"] = wdpa_df["wdpa_pid"]

    return wdpa_df


def enrichWDPA(path, start, end):
    """
    Enrich WDPA data with location information
    :param path:
    :param start:
    :param end:
    :return:
    """
    gdf = gpd.read_file(path, driver="FileGDB", layer=0, rows=slice(start, end))

    gdf = renameColumns(gdf)

    gdf = geostoreLookup(gdf)

    # Filter unused cols
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
        "Geometry",
        "location_id",
        "id",
    ]

    gdf = gdf[columns]

    # Save to csv
    output_dir = r"Test Output"
    output_file = "wdpa_enriched_" + str(start) + "_" + str(end) + ".csv"
    output_path = Path(output_dir) / output_file

    gdf.to_csv(output_path, index=False)

    return not gdf.empty


if __name__ == "__main__":
    start_row = 0
    batch_size = 10000
    fgdb = os.path.join("data", "with_gadm_id.gdb")
    has_more_rows = True

    while has_more_rows:
        print(f"{start_row} -> {start_row + batch_size}")
        try:
            has_more_rows = enrichWDPA(fgdb, start_row, start_row + batch_size)
        except Exception as e:
            print(e)
            print(f"Failed to enrich: {start_row} -> {start_row + batch_size}")
            continue

        start_row = start_row + batch_size
