FROM python:3.12-slim-bookworm

# ODBC driver 18
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates gnupg unixodbc unixodbc-dev \
 && curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/microsoft.gpg \
 && echo "deb [arch=$(dpkg --print-architecture)] https://packages.microsoft.com/debian/12/prod bookworm main" \
      > /etc/apt/sources.list.d/mssql-release.list \
 && apt-get update \
 && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
 && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir pandas pyodbc

WORKDIR /work
ENTRYPOINT ["python", "-u", "/work/prep_for_analysis.py"]
