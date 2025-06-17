FROM python:3.12-slim-bookworm

# --- system deps -------------------------------------------------------
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      curl ca-certificates gnupg \
      build-essential \
      unixodbc unixodbc-dev \
      gdal-bin libgdal-dev \
 && curl -sSL https://packages.microsoft.com/keys/microsoft.asc \
      | gpg --dearmor -o /etc/apt/trusted.gpg.d/microsoft.gpg \
 && echo "deb [arch=$(dpkg --print-architecture)] https://packages.microsoft.com/debian/12/prod bookworm main" \
      > /etc/apt/sources.list.d/mssql-release.list \
 && apt-get update \
 && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
 && rm -rf /var/lib/apt/lists/*

# GDAL env so Fiona builds against the system GDAL
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# --- python deps -------------------------------------------------------
RUN pip install --no-cache-dir pandas shapely pyproj pyodbc fiona

WORKDIR /work
ENTRYPOINT ["python", "-u", "/work/prep_admin0.py"]
