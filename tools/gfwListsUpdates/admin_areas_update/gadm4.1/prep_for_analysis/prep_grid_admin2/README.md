## Usage

### Set Credentials

> _Edit the connection constants at the top of `prep_grid_admin2.py` before running._

### Docker

Build Docker image.

```bash
docker build -t gadm-admin2-gdb .
```

Run the script in the image and exit. Bind-mounts current directory.

```bash
docker run --rm -v "$PWD":/work \
  gadm-admin2-gdb

```

## What it does?

After running, a directory called `gadm4_1_gridded_shp file should appear right next to the script with the gadm dataset with admin_level=2 and an grided layer overlayed by intersection in one single shapefile.
