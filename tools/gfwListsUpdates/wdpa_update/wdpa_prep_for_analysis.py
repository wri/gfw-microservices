import math
import numpy as np
import geopandas as gpd
from shapely import wkb
from pathlib import Path
import wdpa_config as cfg

def createGrid(degrees=1.0):
    """
    Create a Geopandas dataframe fishnet grid

    Params:
        degrees: Size of grid

    Return:
        geodataframe with grid
    """
    ulx, uly, lrx, lry = -180, 90, 180, -90

    # resolution 1 degree grid
    xres = degrees
    yres = -degrees

    # half the resolution
    dx = xres / 2
    dy = yres / 2

    # center coordinates
    xx, yy = np.meshgrid(
        np.arange(ulx + dx, lrx + dx, xres),
        np.arange(uly + dy, lry + dy, yres),
    )

    wkts = []
    for x, y in zip(xx.ravel(), yy.ravel()):
        poly_wkt = (
            f"POLYGON (({x - dx} {y - dy}, "
            f"{x + dx} {y - dy}, "
            f"{x + dx} {y + dy}, "
            f"{x - dx} {y + dy}, "
            f"{x - dx} {y - dy}))"
        )
        wkts.append(poly_wkt)

    s = gpd.GeoSeries.from_wkt(wkts)
    df = gpd.GeoDataFrame(geometry=s, crs="EPSG:4326")
    df["grid"] = df.index

    return df

def main(path_to_fgdb, list_id, split_into=1):
    """
    Loads data and calls helper functions. Saves output to .txt
    Split final file into multiple files if requested.

    Params:
        path_to_fgdb: Path to FGDB with GADMID attached
        list_id: 4 for WDPA
        split_into: Number of equal chunks to split the final output
    """
    # Load data
    print(f"loading {path_to_fgdb}")
    gdf = gpd.read_file(path_to_fgdb, driver="FileGDB", layer="poly_gadm").set_crs(4326)
    print("loaded location_id dataframe")

    # Cleaning and filter
    # gdf = gdf.dropna(subset=["geometry"]).copy()
    # gdf = gdf[~gdf.geometry.is_empty].copy()
    # gdf = gdf[gdf.is_valid].copy()

    #  no copy
    # gdf = gdf.dropna(subset=["geometry"])
    # gdf = gdf[~gdf.geometry.is_empty]

    gdf["list_id"] = list_id

    print("creating in memory grid")
    grid = createGrid(degrees=1)

    print("intersection with grid")
    gdf_intersection = gpd.overlay(
        gdf, grid, how="intersection", keep_geom_type=True, make_valid=True
    )

    print("save geometry as wkb")
    gdf_intersection["geom"] = gdf_intersection.geometry.apply(wkb.dumps, hex=True)

    # Determine output path
    diced_out = Path(cfg.out_dir) / "diced_out.txt"

    # If only one file is desired, just save everything:
    if split_into <= 1:
        print(f"saving to {diced_out}")
        gdf_intersection[["list_id", "location_id", "geom"]].to_csv(
            diced_out, sep="\t", index=False
        )
    else:
        # Split into N chunks
        print(f"Splitting output into {split_into} chunks...")
        total_rows = len(gdf_intersection)
        chunk_size = math.ceil(total_rows / split_into)

        for i in range(split_into):
            start_idx = i * chunk_size
            end_idx = min(start_idx + chunk_size, total_rows)
            if start_idx >= total_rows:
                # If we've already reached the end, break early
                break

            chunk = gdf_intersection.iloc[start_idx:end_idx]
            chunk_file = diced_out.parent / f"{diced_out.stem}_{i}{diced_out.suffix}"
            print(f"  -> saving chunk {i+1}/{split_into} to {chunk_file}")
            chunk[["list_id", "location_id", "geom"]].to_csv(
                chunk_file, sep="\t", index=False
            )

    return

if __name__ == "__main__":
    """This is executed when run from the command line"""
    # Example usage: main(cfg.fgdb_path, 4, split_into=5)
    main(path_to_fgdb=cfg.fgdb_path, list_id=4, split_into=1)
    print("done")
