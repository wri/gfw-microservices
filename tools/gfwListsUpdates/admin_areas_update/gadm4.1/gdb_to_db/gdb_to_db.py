#!/usr/bin/env python3
"""
gadm41_gdb_to_db.py
====================
Usage
-----
    python gadm_gdb_to_db.py gadm41.gdb \
        [--layer LAYER] [--batch-size 5000] [--debug]
"""

from __future__ import annotations
import argparse, os, sys, time, collections, math
from typing import List, Tuple

import fiona, pyproj, pyodbc
from shapely.geometry import shape
from shapely.ops import transform

# ───────────────────────────── CONFIG ─────────────────────────────
SQL_SERVER = ""
SQL_DATABASE = ""
SQL_USER = ""
SQL_PASSWORD = ""
SQL_DRIVER   = "ODBC Driver 18 for SQL Server"
TABLE_NAME   = "list-administrativeAreas41_new"
BATCH_DEFAULT = 5000
# ─────────────────────────────────────────────────────────────────

_transform = pyproj.Transformer.from_crs(4326, 6933, always_xy=True).transform

# -----------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------

def _area_ha(geom):
    return transform(_transform, geom).area / 10_000.0


def _loc_name(*parts):
    return "--".join([p for p in parts if p and p != "NULL"])


def _field(rec, *cands):
    for c in cands:
        if c in rec: return rec[c]
        up, lo = c.upper(), c.lower()
        if up in rec: return rec[up]
        if lo in rec: return rec[lo]
    raise KeyError(f"no field in {cands}")


def _gadmid(rec):
    level = int(_field(rec, "level", "adm_level", "ADM_LEVEL"))
    if "gid" in rec or "GID" in rec:
        gid_val = _field(rec, "gid")
        cls = ("Country", "State", "Sub State")[min(level,2)]
        return gid_val, cls
    if level == 0:
        return _field(rec, "gid_0", "GID_0"), "Country"
    if level == 1:
        return str(_field(rec, "gid_1", "GID_1")).removesuffix("_1"), "State"
    return str(_field(rec, "gid_2", "GID_2")).removesuffix("_2"), "Sub State"

# -----------------------------------------------------------------
# DB helpers
# -----------------------------------------------------------------

def _connect():
    return pyodbc.connect(
        f"DRIVER={{{SQL_DRIVER}}};SERVER={SQL_SERVER};DATABASE={SQL_DATABASE};"+
        f"UID={SQL_USER};PWD={SQL_PASSWORD};TrustServerCertificate=yes;"+"Encrypt=no;", autocommit=False)


def _truncate(cur):
    cur.execute(f"TRUNCATE TABLE [dbo].[{TABLE_NAME}]")


def _insert(cur, rows: List[Tuple]):
    sql = f"""
    INSERT INTO [dbo].[{TABLE_NAME}] (
        [Location Name],[Country],[State],[Sub State],[gadmid],
        [Latitude],[Longitude],[Location Classification],[Size],
        [Geometry],[ErrorDetails]
    ) VALUES (
        ?,?,?,?,?,?,?,?, ?, geometry::STGeomFromText(?,4326), ?)
    """
    cur.fast_executemany = True
    # bind **all** string params as NVARCHAR(MAX) → lifts 8000‑byte cap
    cur.setinputsizes([(pyodbc.SQL_WVARCHAR, 0, 0)] * 11)
    cur.executemany(sql, rows)

# -----------------------------------------------------------------
# Main routine
# -----------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Stream GADM FileGDB into SQL Server")
    ap.add_argument("gdb", help="Path to .gdb directory")
    ap.add_argument("--layer")
    ap.add_argument("--batch-size", type=int, default=BATCH_DEFAULT)
    ap.add_argument("--debug", action="store_true")
    args = ap.parse_args()

    if not os.path.isdir(args.gdb):
        sys.exit("✖ .gdb directory not found")

    layer = args.layer or fiona.listlayers(args.gdb)[0]

    print(f"▶ Streaming layer '{layer}' …", flush=True)
    total_feat = None
    with fiona.open(args.gdb, layer=layer) as src:
        try:
            total_feat = len(src)
        except Exception:
            pass  # some drivers don’t support len()

        batch: List[Tuple] = []
        err_counter = collections.Counter()
        processed = 0
        start = time.time()

        with _connect() as conn:
            cur = conn.cursor()
            _truncate(cur)

            for rec in src:
                processed += 1
                try:
                    props = rec["properties"]
                    geom  = shape(rec["geometry"])

                    gadmid, cls = _gadmid(props)
                    name = _loc_name(_field(props, "name_0", "NAME_0"),
                                      props.get("NAME_1") or props.get("name_1"),
                                      props.get("NAME_2") or props.get("name_2"))
                    cent = geom.centroid
                    batch.append(
                        (
                            name,
                            _field(props, "name_0", "NAME_0"),
                            props.get("NAME_1") or props.get("name_1"),
                            props.get("NAME_2") or props.get("name_2"),
                            gadmid,
                            cent.y,
                            cent.x,
                            cls,
                            _area_ha(geom),
                            geom.wkt,
                            None,
                        )
                    )
                except Exception as exc:
                    err_counter[str(exc)] += 1
                # flush
                if len(batch) >= args.batch_size:
                    _insert(cur, batch)
                    batch.clear()
                    elapsed = time.time() - start
                    rate = processed/elapsed if elapsed else 0
                    pct = (processed/total_feat*100) if total_feat else math.nan
                    print(f"   • {processed:,} processed  {pct:5.1f}%  {rate:,.0f} row/s", flush=True)

            # final flush
            if batch:
                _insert(cur, batch)
            conn.commit()

    print("🏁 Done. Total rows:", processed)
    if err_counter:
        print("• Error rows:")
        for msg, cnt in err_counter.most_common(10):
            print(f"   {cnt:>6} × {msg}")

if __name__ == "__main__":
    main()
