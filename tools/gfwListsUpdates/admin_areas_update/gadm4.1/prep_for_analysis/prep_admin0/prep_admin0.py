#!/usr/bin/env python3
"""
prep_admin0_grid.py – split admin‑level‑0 polygons into 1‑degree tiles
=====================================================================

* Connects to [dbo].[list-administrativeAreas41] (same connection details).
* Fetches **Country‑only** rows (State & Sub State NULL).
* Generates a 1°×1° fishnet grid in EPSG:4326, intersects each country
  polygon, and writes **admin0_grid.tsv** with **multiple rows per country**.

Output columns (tab‑separated):
    list_id   location_id   geom   ↤ geom = STAsBinary hex string
"""

from __future__ import annotations
import os, sys, time, itertools, math, collections

import pandas as pd
import pyodbc
from shapely.geometry import shape, box
from shapely.wkb import loads as wkb_loads
from shapely.ops import transform
import pyproj

# ─────────── connection constants (override via env) ────────────
SQL_SERVER   = os.getenv("SQL_SERVER",   "34.194.123.26,65300")
SQL_DATABASE = os.getenv("SQL_DATABASE", "gfwpro")
SQL_USER     = os.getenv("SQL_USER",     "GFWProUser")
SQL_PASSWORD = os.getenv("SQL_PASSWORD", "gtt9MSvs4^gN*J!c")
SQL_DRIVER   = "ODBC Driver 18 for SQL Server"
# ───────────────────────────────────────────────────────────────

CONN_STR = (
    f"DRIVER={{{SQL_DRIVER}}};SERVER={SQL_SERVER};DATABASE={SQL_DATABASE};"
    f"UID={SQL_USER};PWD={SQL_PASSWORD};Encrypt=no;TrustServerCertificate=yes;"
)

SELECT_ADMIN0 = """
SELECT
    CAST(1 AS int)        AS list_id,
    location_id,
    Geometry.STAsBinary() AS geom_bin
FROM dbo.[list-administrativeAreas41]
WHERE [State] IS NULL AND [Sub State] IS NULL AND Country IS NOT NULL;
"""

# equal‑area proj for area if needed later
_transform = pyproj.Transformer.from_crs(4326, 6933, always_xy=True).transform


def tile_gen(minx: float, maxx: float, miny: float, maxy: float):
    """Yield (lon, lat, tile_poly) covering bbox with 1‑degree cells."""
    for lon in range(math.floor(minx), math.ceil(maxx)):
        for lat in range(math.floor(miny), math.ceil(maxy)):
            yield lon, lat, box(lon, lat, lon + 1, lat + 1)


def main():
    print("Connecting & fetching Country rows …")
    with pyodbc.connect(CONN_STR) as conn:
        df = pd.read_sql_query(SELECT_ADMIN0, conn)

    print(f"Fetched {len(df):,} countries. Intersecting fishnet …")
    rows = []
    count = 0
    start = time.time()

    for _, rec in df.iterrows():
        geom = wkb_loads(rec.geom_bin, hex=False)
        minx, miny, maxx, maxy = geom.bounds
        for _, _, tile in tile_gen(minx, maxx, miny, maxy):
            inter = geom.intersection(tile)
            if not inter.is_empty:
                rows.append((rec.list_id, rec.location_id, inter.wkb_hex))
        count += 1
        if count % 20 == 0:
            print(f"  processed {count}/{len(df)} countries (tiles so far {len(rows):,})", flush=True)

    out = pd.DataFrame(rows, columns=["list_id", "location_id", "geom"])
    out.to_csv("admin0_grid.tsv", sep="\t", index=False)
    print(f"🏁 Wrote admin0_grid.tsv  → {len(out):,} rows in {time.time()-start:.1f}s")

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.exit(f"✖ {exc}")
