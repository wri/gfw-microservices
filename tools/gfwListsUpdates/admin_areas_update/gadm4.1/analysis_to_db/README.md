## Usage

### Credentials

> Edit script file with credentials at the top (optional).

### Docker

Build

```sh
docker build -t analysis-loader .
```

Run the script (credentials optional)

```sh
docker run --rm -v "$PWD":/work \
  -e SQL_SERVER=host.docker.internal,1433 \
  -e SQL_DATABASE=MyDB \
  -e SQL_USER=sa -e SQL_PASSWORD=P@ssw0rd \
  analysis-loader analysis_admin2.csv analysis_admin1.csv analysis_admin0.csv
```

## What it does?

It processess the analysis data into gfwpro database. Matching columns with columns.
