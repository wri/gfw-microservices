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
        poly_wkt = f"POLYGON (({x - dx} {y - dy}, {x + dx} {y - dy}, {x + dx} {y + dy}, {x - dx} {y + dy}, {x - dx} {y - dy}))"
        wkts.append(poly_wkt)

    s = gpd.GeoSeries.from_wkt(wkts)
    df = gpd.GeoDataFrame(geometry=s, crs="EPSG:4326")
    df["grid"] = df.index

    return df

def main(path_to_fgdb, list_id):
    """
    Loads data and calls helper functions. Saves output to .txt

    Params:
        path_to_fgdb: Path to FGDB with GADMID attached
        list_id: 4 for WDPA
    """
    # Load data
    print(f"loading {path_to_fgdb}")
    gdf = gpd.read_file(path_to_fgdb, driver="FileGDB", layer="poly_gadm").set_crs(4326)
    print("loaded location_id dataframe")

    gdf["list_id"] = list_id
    gdf["location_id"] = gdf.index

    # # Not needed
    # undiced_out = str(Path(cfg.out_dir) / "undiced_out.txt")
    # print(f"saving to {undiced_out}")
    # gdf.to_csv(undiced_out, sep="\t", index=False)

    print("creating in memory grid")
    grid = createGrid(degrees=1)

    print("intersection with grid")
    gdf_intersection = gpd.overlay(
        gdf, grid, how="intersection", keep_geom_type=True, make_valid=True
    )

    print("save geometry as wkb")
    gdf_intersection["geom"] = gdf_intersection.geometry.apply(
        wkb.dumps, hex=True
    )  # add in wkb

    diced_out = str(Path(cfg.out_dir) / "diced_out.txt")
    print(f"saving to {diced_out}")
    gdf_intersection[["list_id", "location_id", "geom"]].to_csv(
        diced_out, sep="\t", index=False
    )

    return

if __name__ == "__main__":
    """This is executed when run from the command line"""

    main(path_to_fgdb = cfg.fgdb_path,
         list_id = 4
         )

    print("done")
