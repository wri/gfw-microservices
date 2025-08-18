#!/usr/bin/env python3
"""
prep_grid_admin2.py – grid-clip admin-2 polygons to 1° cells and export Shapefile.

Fixes:
- Robust WKB decode (handles VARBINARY *or* hex text).
- Default is full world (no analysis join);
"""

from __future__ import annotations
import os, sys, math, argparse, tempfile, subprocess, pathlib, shutil
import pandas as pd
import pyodbc
from shapely.geometry import box, mapping, MultiPolygon
from shapely.wkb import loads as wkb_loads
import fiona

# ───────── connection via env ─────────
SQL_SERVER   = os.getenv("SQL_SERVER",   "")
SQL_DATABASE = os.getenv("SQL_DATABASE", "")
SQL_USER     = os.getenv("SQL_USER",     "")
SQL_PASSWORD = os.getenv("SQL_PASSWORD", "")
SQL_DRIVER   = "ODBC Driver 18 for SQL Server"
CONN_STR = (
    f"DRIVER={{{SQL_DRIVER}}};SERVER={SQL_SERVER};DATABASE={SQL_DATABASE};"
    f"UID={SQL_USER};PWD={SQL_PASSWORD};Encrypt=no;TrustServerCertificate=yes;"
)

SELECT_ALL_ADMIN2 = """
SELECT
  CAST(1 AS int) AS list_id,
  location_id,
  Country,
  [State],
  [Sub State] AS Sub_State,
  gadmid,
  Geometry.STAsBinary() AS geom_bin   -- VARBINARY (bytes), not hex text
FROM dbo.[list-administrativeAreas41]
WHERE [Sub State] IS NOT NULL;
"""

def decode_wkb(val):
    """Return a Shapely geometry from either VARBINARY or hex-string WKB."""
    if val is None:
        return None
    # pyodbc often returns memoryview for varbinary
    if isinstance(val, (bytes, bytearray, memoryview)):
        return wkb_loads(bytes(val), hex=False)
    if isinstance(val, str):
        s = val[2:] if val.startswith("0x") else val
        return wkb_loads(s, hex=True)
    raise TypeError(f"Unsupported WKB type: {type(val)}")

def fishnet(minx, maxx, miny, maxy, step=1):
    x0, x1 = math.floor(minx), math.ceil(maxx)
    y0, y1 = math.floor(miny), math.ceil(maxy)
    x = x0
    while x < x1:
        y = y0
        while y < y1:
            yield box(x, y, x + step, y + step)
            y += step
        x += step

def to_multipolygon(geom):
    """Keep only polygonal parts, return MultiPolygon or None."""
    if geom.is_empty:
        return None
    gtype = geom.geom_type
    if gtype == "Polygon":
        return MultiPolygon([geom])
    if gtype == "MultiPolygon":
        return geom
    if gtype == "GeometryCollection":
        parts = []
        for g in geom.geoms:
            if g.is_empty: 
                continue
            if g.geom_type == "Polygon":
                parts.append(g)
            elif g.geom_type == "MultiPolygon":
                parts.extend([p for p in g.geoms if not p.is_empty])
        return MultiPolygon(parts) if parts else None
    return None  # ignore LineString/Point

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--grid-step", type=float, default=1.0,
                    help="grid cell size in degrees (default 1.0)")
    ap.add_argument("--out", default="gadm4_1_gridded_shp",
                    help="output Shapefile directory name")
    args = ap.parse_args()

    tmp_dir = tempfile.mkdtemp(prefix="admin2_tiles_")
    gpkg = os.path.join(tmp_dir, "tiles.gpkg")

    # Query
    sql = SELECT_ALL_ADMIN2
    print("Connecting to SQL Server …")
    with pyodbc.connect(CONN_STR) as conn:
        df = pd.read_sql_query(sql, conn)

    total = len(df)
    print(f"Fetched {total:,} admin-2 rows. Tiling & clipping …")

    # GPKG sink
    schema = {"geometry":"MultiPolygon","properties":{
        "list_id":"int","location_id":"int","Country":"str","State":"str","SubState":"str","gadmid":"str"}}
    with fiona.open(gpkg, "w", driver="GPKG", schema=schema, crs="EPSG:4326") as sink:
        for idx, rec in df.iterrows():
            geom = decode_wkb(rec.geom_bin)
            if geom is None or geom.is_empty:
                continue
            minx, miny, maxx, maxy = geom.bounds
            for cell in fishnet(minx, maxx, miny, maxy, step=args.grid_step):
                inter = geom.intersection(cell)
                mp = to_multipolygon(inter)
                if mp:
                    sink.write({
                        "geometry": mapping(mp),
                        "properties": {
                            "list_id": int(rec.list_id),
                            "location_id": int(rec.location_id),
                            "Country": rec.Country,
                            "State":   rec.State,
                            "SubState":rec.Sub_State,
                            "gadmid":  rec.gadmid,
                        }
                    })
            if (idx+1) % 1000 == 0:
                print(f"  processed {idx+1:,}/{total:,}", flush=True)

    # Convert to Shapefile folder
    shp_dir = args.out
    p = pathlib.Path(shp_dir)
    if p.exists():
        shutil.rmtree(p, ignore_errors=True)
    subprocess.run(["ogr2ogr", "-f", "ESRI Shapefile", shp_dir, gpkg], check=True)
    print(f"🏁 Created {shp_dir}")
    shutil.rmtree(tmp_dir, ignore_errors=True)

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.exit(f"✖ {exc}")
