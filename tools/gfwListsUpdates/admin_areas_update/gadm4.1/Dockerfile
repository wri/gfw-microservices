# ---------- Dockerfile -------------------------------------------------
  FROM python:3.12-slim-bullseye

  # -- 1. OS deps for Geo stack + ODBC -----------------------------------
  RUN apt-get update \
   && apt-get install -y --no-install-recommends \
        g++ build-essential \
        gdal-bin libgdal-dev \
        unixodbc unixodbc-dev curl ca-certificates gnupg \
   && rm -rf /var/lib/apt/lists/*
  
  # -- 2. Microsoft ODBC Driver 17 ---------------------------------------
  RUN mkdir -p /etc/apt/keyrings \
   && curl -sSL https://packages.microsoft.com/keys/microsoft.asc \
        | gpg --dearmor -o /etc/apt/keyrings/microsoft.gpg \
   && echo "deb [arch=$(dpkg --print-architecture) \
            signed-by=/etc/apt/keyrings/microsoft.gpg] \
            https://packages.microsoft.com/debian/12/prod bookworm main" \
        > /etc/apt/sources.list.d/mssql-release.list \
   && apt-get update \
   && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
   && rm -rf /var/lib/apt/lists/*
  
  # -- 3. Python geospatial & ODBC libs -----------------------------------
  RUN pip install --no-cache-dir \
        geopandas==0.14.* pyodbc fiona shapely pyproj pandas
  
  # -- 4. Container workspace --------------------------------------------
  WORKDIR /work
  ENTRYPOINT ["python", "-u"]
  # ----------------------------------------------------------------------
  