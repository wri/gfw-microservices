## Usage

### Set Credentials

> _Edit the connection constants at the top of `prep_admin0.py` before running._

### Docker

Build

```bash
docker build -t gadm-admin0-grid .
```

Run the script in the image and exit. Bind-mounts current directory.

```bash
docker run --rm -v "$PWD":/work gadm-admin0-grid

```

## What it does?

TBD
