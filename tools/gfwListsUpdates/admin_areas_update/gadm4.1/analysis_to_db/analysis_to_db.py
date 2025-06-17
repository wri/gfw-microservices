#!/usr/bin/env python3
"""
analysis_to_db.py – load analysis CSV/TSV files into
[dbo].[analysis-administrativeAreas_import].

Fix: fetch column metadata from a **cursor**, not the connection, to avoid
`AttributeError: 'pyodbc.Connection' object has no attribute 'description'`.
"""

import os, sys, argparse, pyodbc, pandas as pd

TABLE = "[dbo].[analysis-administrativeAreas_import]"
SQL_DRIVER = "ODBC Driver 18 for SQL Server"

CONN_STR = (
    f"DRIVER={{{SQL_DRIVER}}};SERVER={os.environ['SQL_SERVER']};"
    f"DATABASE={os.environ['SQL_DATABASE']};UID={os.environ['SQL_USER']};"
    f"PWD={os.environ['SQL_PASSWORD']};Encrypt=no;TrustServerCertificate=yes;"
)

# ───── get DB column list (skip identity id) ─────
with pyodbc.connect(CONN_STR) as _conn:
    _cur = _conn.cursor()
    _cur.execute(f"SELECT TOP 0 * FROM {TABLE}")
    DB_COLS = [d[0] for d in _cur.description if d[0].lower() != "id"]

PLACEHOLDERS = ",".join("?" * len(DB_COLS))
INSERT_SQL = (
    f"INSERT INTO {TABLE} (" + ",".join(f"[{c}]" for c in DB_COLS) + ") "
    f"VALUES ({PLACEHOLDERS})"
)


def load_file(path: str, delim: str | None):
    df = pd.read_csv(path, sep=delim, engine="python") if delim else pd.read_csv(path, sep=None, engine="python")
    if "location_status_id" not in df.columns and "status_code" in df.columns:
        df.rename(columns={"status_code": "location_status_id"}, inplace=True)
    for c in DB_COLS:
        if c not in df.columns:
            df[c] = pd.NA
    return df.reindex(columns=DB_COLS).where(pd.notna(df), None)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+", help="CSV/TSV files in load order")
    ap.add_argument("--batch-size", type=int, default=5000)
    ap.add_argument("--truncate", action="store_true")
    ap.add_argument("--delimiter", choices=[",", "t"], help=", or t (tab)")
    args = ap.parse_args()
    delim = "\t" if args.delimiter == "t" else args.delimiter

    with pyodbc.connect(CONN_STR) as conn:
        cur = conn.cursor()
        if args.truncate:
            cur.execute(f"TRUNCATE TABLE {TABLE}")
        cur.fast_executemany = True

        total = 0
        for fp in args.files:
            df = load_file(fp, delim)
            rows = df.values.tolist()
            for i in range(0, len(rows), args.batch_size):
                cur.executemany(INSERT_SQL, rows[i:i + args.batch_size])
                total += len(rows[i:i + args.batch_size])
                if total % (args.batch_size * 10) == 0:
                    print(f"  • {total:,} rows inserted", flush=True)
        conn.commit()
    print(f"🏁 Inserted {total:,} rows.")

if __name__ == "__main__":
    main()
