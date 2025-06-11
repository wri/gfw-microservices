## Usage

### Set Credentials

> _Edit the connection constants at the top of `prep_for_analysis.py` before running._

### Docker

Build

```bash
docker build -t gadm-prep .
```

Run the script in the image and exit. Bind-mounts current directory.

```bash
docker run --rm -v "$PWD":/work gadm-prep

```

## What it does?

After running, 2 tsv files should appear right next to the script inside `prep_all/` containing the data with admin1 and admin2 levels, ready to be send for analysis.

## On [adminLevel=0] data

This tool will not handle data adminLevel=0 due to the size of the geometries for some countries, like Russia and Canada, making the analysis tool hard to proess.

A different tool, `prep_admin0` was prepared, which loads the admin0 data and adds a gridded (or fishent) layer overlay to the geometries, for geoprocessing.
