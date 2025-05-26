#!/usr/bin/env python3
"""
gadm41_gdb_to_db.py
====================
Usage
-----
    python3 gadm_gdb_to_mssql.py /path/to/gadm41.gdb [--layer LAYERNAME]

Requirements
------------
    pip3 install geopandas fiona pyproj shapely pandas pyodbc
"""

import argparse
import os
import sys
from typing import List, Tuple, Optional

import geopandas as gpd
import fiona
import pandas as pd
import pyodbc
import pyproj
from shapely.ops import transform
from shapely.geometry.base import BaseGeometry
import pdb

# ---------------------------------------------------------------------------
# SQL Server connection settings - EDIT ME
# ---------------------------------------------------------------------------
SQL_SERVER = ""
SQL_DATABASE = ""
SQL_USER = ""
SQL_PASSWORD = ""
SQL_DRIVER = "ODBC Driver 18 for SQL Server" 
TABLE_NAME = "list-administrativeAreas41_new"
# ---------------------------------------------------------------------------

# Equal-area transformation for accurate size (area) calculation
_TRANSFORMER = pyproj.Transformer.from_crs(4326, 6933, always_xy=True).transform  # EPSG:6933 - World Cylindrical Equal Area

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def _calc_area_ha(geom: BaseGeometry) -> float:
    """Return area in **hectares** using an equal-area projection."""
    return transform(_TRANSFORMER, geom).area / 10_000.0  # 1 ha = 10 000 m²


def _build_location_name(country: Optional[str], state: Optional[str], sub: Optional[str]) -> str:
    parts = [p for p in (country, state, sub) if p not in (None, "", "NULL")]
    return "--".join(parts)


def _derive_gadmid(row) -> Tuple[str, str]:
    """Return (gadmid, location_classification) from a row."""
    level = int(row["adm_level"])
    if level == 0:
        return row["gid_0"], "Country"
    if level == 1:
        return str(row["gid_1"]).replace("_1", ""), "State"
    # assume level 2 otherwise
    return str(row["gid_2"]).replace("_2", ""), "Sub State"

# ---------------------------------------------------------------------------
# Core ETL routine
# ---------------------------------------------------------------------------

def extract_records(gdb_path: str, layer: Optional[str] = None) -> List[Tuple]:
    """Read FileGDB and return list of tuples ready for SQL insertion."""
    if layer is None:
        layer = fiona.listlayers(gdb_path)[0]
    gdf = gpd.read_file(gdb_path, layer=layer).to_crs(4326)

    records: List[Tuple] = []
    for _, feat in gdf.iterrows():
        try:
            gadmid, loc_class = _derive_gadmid(feat)
            country = feat.get("name_0")
            state = feat.get("name_1")
            sub_state = feat.get("name_2")
            loc_name = _build_location_name(country, state, sub_state)

            centroid = feat.geometry.centroid
            latitude, longitude = centroid.y, centroid.x

            size_ha = _calc_area_ha(feat.geometry)

            records.append(
                (
                    loc_name,
                    country,
                    state,
                    sub_state,
                    gadmid,
                    latitude,
                    longitude,
                    loc_class,
                    size_ha,
                    feat.geometry.wkt,
                    None,  # ErrorDetails
                )
            )
        except Exception as exc:  # catch-all per-row failure
            records.append(
                (None, None, None, None, None, None, None, None, None, None, str(exc))
            )
    return records

# ---------------------------------------------------------------------------
# SQL helpers
# ---------------------------------------------------------------------------

def _connect() -> pyodbc.Connection:
    """Open a pyodbc connection using the constants above."""
    conn_str = (
        f"DRIVER={{{SQL_DRIVER}}};"
        f"SERVER={SQL_SERVER};DATABASE={SQL_DATABASE};"
        f"UID={SQL_USER};PWD={SQL_PASSWORD};"
        "TrustServerCertificate=yes;"
    )
    return pyodbc.connect(conn_str, autocommit=False)


def _truncate(cursor: pyodbc.Cursor):
    cursor.execute(f"TRUNCATE TABLE [dbo].[{TABLE_NAME}]")


def _insert(cursor: pyodbc.Cursor, rows: List[Tuple]):
    sql = f"""
    INSERT INTO [dbo].[{TABLE_NAME}] (
        [Location Name], [Country], [State], [Sub State], [gadmid],
        [Latitude], [Longitude], [Location Classification], [Size],
        [Geometry], [ErrorDetails]
    ) VALUES (
        ?,?,?,?,?,?,?,?, ?,
        geometry::STGeomFromText(?, 4326),
        ?
    )"""
    cursor.fast_executemany = True  # big performance win
    cursor.executemany(sql, rows)

# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Ingest GADM v4.1 FileGDB into SQL Server")
    parser.add_argument("gdb", help="Path to the *.gdb folder")
    parser.add_argument("--layer", help="Specific layer name inside the GDB (default: first layer)")
    args = parser.parse_args()

    if not os.path.exists(args.gdb):
        sys.exit(f"FileGDB not found: {args.gdb}")

    print("▶ Extracting features …", flush=True)
    records = extract_records(args.gdb, args.layer)
    print(f"   {len(records):,} records prepared.")

    print("▶ Inserting into SQL Server …", flush=True)
    with _connect() as conn:
        cur = conn.cursor()
        _truncate(cur)
        _insert(cur, records)
        conn.commit()
    print("✔ Done.")


if __name__ == "__main__":
    main()
