# SQLAlchemy connection string
sal_string = "mssql://{USERNAME}:{PASSWORD}@{SERVER}/{DATABASE}?driver=ODBC Driver 17 for SQL Server"

# PyODBC connection string
conn_string = "DRIVER={ODBC Driver 17 for SQL Server};SERVER={SERVER},65300;DATABASE={DATABASE};UID={USERNAME};PWD={PASSWORD};"

# WDPA Results
processed_csv = r"D:\data\gfw_list_updates\wdpa_update\wdpa_data\wdpa_results.csv"

# Path to GDB with GADMIDs
### LAYER NEEDS TO BE NAMED "poly_gadm" ###
fgdb_path = r"D:\data\gfw_list_updates\wdpa_update\wdpa_data\gadm_merge.gdb"

# Output directory
out_dir = r"wdpa_data"

# Geostore ID JSON path
json_path = r"D:\data\gfw_list_updates\wdpa_update\wdpa_data\geostore_crosswalk.json"