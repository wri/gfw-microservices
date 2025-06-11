FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip python3-dev build-essential \
      unixodbc unixodbc-dev curl ca-certificates gnupg \
 && curl -sSL https://packages.microsoft.com/keys/microsoft.asc \
      | gpg --dearmor -o /etc/apt/trusted.gpg.d/microsoft.gpg \
 && echo "deb [arch=$(dpkg --print-architecture)] https://packages.microsoft.com/debian/12/prod bookworm main" \
      > /etc/apt/sources.list.d/mssql-release.list \
 && apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
 && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir pandas pyodbc

WORKDIR /work
COPY analysis_to_db.py /work/
ENTRYPOINT ["python3", "-u", "/work/analysis_to_db.py"]
