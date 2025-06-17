#!/usr/bin/env python3
"""
prep_grid_admin2.py – exports and clips admin‑2 polygons by 1° grid and export as
an ESRI Shapefile (directory) named **gadm4_1_grided_shp**.
"""
from __future__ import annotations
import os, sys, math, tempfile, subprocess, pathlib, shutil
import pandas as pd
import pyodbc
from shapely.geometry import box, mapping, MultiPolygon, Polygon
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

SELECT_ADMIN2 = """
SELECT CAST(1 AS int) AS list_id, location_id, Country,[State], [Sub State] AS Sub_State,
       gadmid, Geometry.STAsBinary() AS geom_bin
FROM dbo.[list-administrativeAreas41]
WHERE [Sub State] IS NOT NULL;"""

def fishnet(minx, maxx, miny, maxy):
    for lon in range(math.floor(minx), math.ceil(maxx)):
        for lat in range(math.floor(miny), math.ceil(maxy)):
            yield box(lon, lat, lon + 1, lat + 1)

def to_multi(geom):
    if geom.is_empty:
        return None
    if geom.geom_type == "Polygon":
        return MultiPolygon([geom])
    if geom.geom_type == "MultiPolygon":
        return geom
    if geom.geom_type == "GeometryCollection":
        polys=[g for g in geom.geoms if g.geom_type in ("Polygon","MultiPolygon") and not g.is_empty]
        if not polys:
            return None
        parts=[]
        for g in polys:
            if g.geom_type=="Polygon":
                parts.append(g)
            else:
                parts.extend([p for p in g.geoms if not p.is_empty])
        return MultiPolygon(parts)
    return None

def main():
    tmp_dir=tempfile.mkdtemp(prefix="admin2_tiles_")
    gpkg=os.path.join(tmp_dir,"tiles.gpkg")
    with pyodbc.connect(CONN_STR) as conn:
        df=pd.read_sql_query(SELECT_ADMIN2,conn)
    schema={"geometry":"MultiPolygon","properties":{
        "list_id":"int","location_id":"int","Country":"str","State":"str","SubState":"str","gadmid":"str"}}
    with fiona.open(gpkg,"w",driver="GPKG",schema=schema,crs="EPSG:4326") as sink:
        for idx,rec in df.iterrows():
            geom=wkb_loads(rec.geom_bin,hex=False)
            for cell in fishnet(*geom.bounds):
                mp=to_multi(geom.intersection(cell))
                if mp:
                    sink.write({"geometry":mapping(mp),"properties":{
                        "list_id":int(rec.list_id),"location_id":int(rec.location_id),
                        "Country":rec.Country,"State":rec.State,"SubState":rec.Sub_State,"gadmid":rec.gadmid}})
    shp_dir="gadm4_1_grided_shp"
    if pathlib.Path(shp_dir).exists():
        shutil.rmtree(shp_dir,ignore_errors=True)
    subprocess.run(["ogr2ogr","-f","ESRI Shapefile",shp_dir,gpkg],check=True)
    print("🏁 Created",shp_dir)
    shutil.rmtree(tmp_dir,ignore_errors=True)
if __name__=="__main__":
    try:
        main()
    except Exception as exc:
        sys.exit(f"✖ {exc}")
