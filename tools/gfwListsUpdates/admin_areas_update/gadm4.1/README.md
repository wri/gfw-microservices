# GADM v4.1 → SQL Server

Tool that reads a FileGDB, process it for GADM4.1 by deriving centroids, coordinates, area in hectares, hierarchical names, and ingests administrative-area polygons into GFWPro database table `[dbo].[list-administrativeAreas41_new]`.

## What it does

- **Extract** – loads the `gadm41_*.gdb` layer with GeoPandas / GDAL.
- **Transform**

  - computes centroid `Lat/Lon` (may lie outside multipart polygons).
  - area calculated in EPSG 6933, stored as hectares.
  - builds `Location Name` as `Country--State--Sub State`.
  - strips trailing `_1` / `_2` from `gid_1` / `gid_2` ⇒ `gadmid`.

- **Inserts/Loads** – truncates `[dbo].[list‑administrativeAreas41_new]` then bulk‐inserts
  rows with geometry (`SRID 4326`) via PyODBC.

---

## Requirements

1. Input data

   - GADM 4.1 FileGeodatabase directory (`gadm41_.gdb/`).

2. Target database

   - Database credentials. Credentials should not be pushed.
   - [dbo].[list‑administrativeAreas41_new] **already existing** with the columns listed in `gadm_gdb_to_db.py`.

3. Docker (optional)
   - To run script encapsulated inside an image.

## Usage

### Set Credentials

> _Edit the connection constants at the top of `gadm_gdb_to_db.py` before running._

### Docker

Build Docker image.

```bash
docker build -t gadm-loader .
```

Run the script in the image and exit. Bind-mounts current directory.

```bash
docker run --rm -v "$PWD":/work \
  gadm-loader \
  gadm_gdb_to_mssql.py /work/gadm41.gdb

```

### Natively

```bash
# Python
python -m venv venv && source venv/bin/activate
pip install geopandas fiona shapely pyproj pandas pyodbc

# Run
python gadm_gdb_to_db.py /path/to/gadm41.gdb
```

---

https://gfw.atlassian.net/browse/GPV-4251
