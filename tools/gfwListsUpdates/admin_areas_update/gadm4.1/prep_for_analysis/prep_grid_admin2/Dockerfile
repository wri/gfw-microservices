FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# ---- system deps ------------------------------------------------------
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      gdal-bin libgdal-dev \
      python3 python3-pip python3-dev \
      curl ca-certificates gnupg build-essential \
      unixodbc unixodbc-dev \
 && curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/microsoft.gpg \
 && echo "deb [arch=$(dpkg --print-architecture)] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list \
 && apt-get update \
 && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
 && rm -rf /var/lib/apt/lists/*

# GDAL build hints for Fiona
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal
# (Optional) print GDAL version for logs
RUN echo "GDAL version $(gdal-config --version)"

RUN apt-get update && apt-get install -y software-properties-common \
  && add-apt-repository ppa:ubuntugis/ubuntugis-unstable -y \
  && apt-get update \
  && apt-get install -y gdal-bin libgdal-dev

# ---- python deps ------------------------------------------------------
RUN pip3 install --no-cache-dir --upgrade pip \
  && pip3 install --no-cache-dir pandas shapely pyproj pyodbc \
  && pip3 install --no-cache-dir fiona

# ---- copy script & set entrypoint ------------------------------------
WORKDIR /work
COPY prep_grid_admin2.py /work/
ENTRYPOINT ["python3", "-u", "/work/prep_grid_admin2.py"]
