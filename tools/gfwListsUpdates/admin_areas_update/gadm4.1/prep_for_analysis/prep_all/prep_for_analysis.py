#!/usr/bin/env python3
"""
Export GADM 4.1 rows from [dbo].[list-administrativeAreas41] into three
CSV files for the analysis pipeline.

• admin2.csv  - rows that contain a Sub-State (ADM level 2)
• admin1.csv  - rows that contain a State but *no* Sub-State (level 1)
• admin0.csv  - Country-only rows (level 0)

Each CSV has identical columns:
    list_id, location_id, geom

Connection details are constants below; edit as needed.
"""

import os, sys
import pandas as pd
import pyodbc

# ──────────────── connection constants ────────────────
SQL_SERVER   = ""
SQL_DATABASE = ""
SQL_USER     = ""
SQL_PASSWORD = ""
SQL_DRIVER   = "ODBC Driver 18 for SQL Server"
# ──────────────────────────────────────────────────────

CONN_STR = (
    f"DRIVER={{{SQL_DRIVER}}};SERVER={SQL_SERVER};DATABASE={SQL_DATABASE};"
    f"UID={SQL_USER};PWD={SQL_PASSWORD};Encrypt=no;TrustServerCertificate=yes;"
)

BASE_QUERY = """
SELECT
    CAST(1 AS int)               AS list_id,
    location_id,
    CONVERT(varchar(max), Geometry.STAsBinary(), 2) AS geom,
    Country, State, [Sub State]
FROM dbo.[list-administrativeAreas41]
"""

OUTFILES = [
    ("admin2.tsv", lambda df: df[ df["Sub State"].notna() ]),
    ("admin1.tsv", lambda df: df[(df["Sub State"].isna()) & (df["State"].notna())]),
    ("admin0.tsv", lambda df: df[(df["Sub State"].isna()) & (df["State"].isna()) & (df["Country"].notna())]),
]

TSV_KWARGS = dict(index=False, sep="\t", header=True)


def main():
    print("Connecting …")
    with pyodbc.connect(CONN_STR) as conn:
        df = pd.read_sql(BASE_QUERY, conn)

    print(f"Fetched {len(df):,} rows. Writing TSVs …")
    base_cols = ["list_id", "location_id", "geom"]

    for fname, filt in OUTFILES:
        part = filt(df)[base_cols]
        part.to_csv(fname, **TSV_KWARGS)
        print(f"  • {fname:10}  {len(part):,} rows")

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.exit(f"✖ {exc}")
