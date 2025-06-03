#!/usr/bin/env python3
"""
Export GADM 4.1 rows from [dbo].[list-administrativeAreas41] into three
CSV files for the analysis pipeline.

• admin2.csv  – rows that contain a Sub-State (ADM level 2)
• admin1.csv  – rows that contain a State but *no* Sub-State (level 1)
• admin0.csv  – Country-only rows (level 0)

Each CSV has identical columns:
    list_id, location_id, geom

Connection details are constants below; edit as needed.
"""

import os, sys
import pandas as pd
import pyodbc

# ──────────────── connection constants ────────────────
SQL_SERVER   = "34.194.123.26,65300"
SQL_DATABASE = "gfwpro"
SQL_USER     = "GFWProUser"
SQL_PASSWORD = "gtt9MSvs4^gN*J!c"
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
    Country, State, [Sub State]                     -- used for filtering only
FROM dbo.[list-administrativeAreas41]
"""

def main() -> None:
    print("Connecting …")
    with pyodbc.connect(CONN_STR) as conn:
        df = pd.read_sql(BASE_QUERY, conn)

    print(f"Fetched {len(df):,} rows.  Splitting …")

    # split by presence of State / Sub-State
    admin2 = df[df["Sub State"].notna()]
    admin1 = df[(df["Sub State"].isna()) & (df["State"].notna())]
    admin0 = df[(df["Sub State"].isna()) & (df["State"].isna()) & (df["Country"].notna())]

    for name, frame in [("admin2.csv", admin2),
                        ("admin1.csv", admin1),
                        ("admin0.csv", admin0)]:
        out = frame[["list_id", "location_id", "geom"]]
        out.to_csv(name, index=False)
        print(f"  • wrote {name:10}  {len(out):,} rows")

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.exit(f"✖ {exc}")
