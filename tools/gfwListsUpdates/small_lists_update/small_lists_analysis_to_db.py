import sys
import pyodbc
import pandas as pd
import small_lists_config as cfg

def create_table(conn, table_name):
    """
    Creates a table in the dev DB

    Params:
        table_name: Name of temp table to create
    """
    with conn:
        cursor = conn.cursor()
        create_table_sql = f"""
            CREATE TABLE [dbo].[{table_name}](
            [id] [INT] NOT NULL,
            [location_id] [INT] NOT NULL,
            [location_status_id] [INT] NOT NULL,
            [tree_cover_loss_total_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_primary_forest_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_peat_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_intact_forest_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_protected_areas_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_sea_landcover_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_idn_landcover_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_idn_primary_forest_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_soy_yearly] [NVARCHAR](2000) NULL,
            [tree_cover_loss_idn_legal_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_idn_forest_moratorium_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_prodes_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_prodes_wdpa_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_prodes_primary_forest_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_loss_brazil_biomes_yearly] [NVARCHAR](MAX) NULL,
            [tree_cover_extent_total] [DECIMAL](18, 6) NULL,
            [tree_cover_extent_primary_forest] [DECIMAL](18, 6) NULL,
            [tree_cover_extent_protected_areas] [DECIMAL](18, 6) NULL,
            [tree_cover_extent_peat] [DECIMAL](18, 6) NULL,
            [tree_cover_extent_intact_forest] [DECIMAL](18, 6) NULL,
            [natural_habitat_primary] [DECIMAL](18, 6) NULL,
            [natural_habitat_intact_forest] [DECIMAL](18, 6) NULL,
            [natural_habitat_global_land_cover] [NVARCHAR](MAX) NULL,
            [total_area] [DECIMAL](18, 6) NULL,
            [protected_areas_area] [DECIMAL](18, 6) NULL,
            [critical_habitat_alliance_zero] [DECIMAL](18, 6) NULL,
            [indigenous_people_land_rights] [DECIMAL](18, 6) NULL,
            [peat_area] [DECIMAL](18, 6) NULL,
            [fires_counts_monthly] [NVARCHAR](MAX) NULL,
            [soy_total_area] [NVARCHAR](MAX) NULL,
            [soy_pre2001_nonforest_area] [DECIMAL](18, 6) NULL,
            [brazil_biomes] [NVARCHAR](MAX) NULL,
            [idn_legal_area] [NVARCHAR](MAX) NULL,
            [sea_landcover_area] [NVARCHAR](MAX) NULL,
            [idn_landcover_area] [NVARCHAR](MAX) NULL,
            [idn_forest_moratorium_area] [DECIMAL](18, 6) NULL,
            [south_america_presence] [NVARCHAR](50) NULL,
            [legal_amazon_presence] [NVARCHAR](50) NULL,
            [brazil_biomes_presence] [NVARCHAR](50) NULL,
            [cerrado_biome_presence] [NVARCHAR](50) NULL,
            [southeast_asia_presence] [NVARCHAR](50) NULL,
            [indonesia_presence] [NVARCHAR](50) NULL,
            [commodity_threat_deforestation_level] [NVARCHAR](MAX) NULL,
            [commodity_threat_peat_level] [NVARCHAR](MAX) NULL,
            [commodity_threat_protected_areas_level] [NVARCHAR](MAX) NULL,
            [commodity_threat_fires_level] [NVARCHAR](MAX) NULL,
            [commodity_threat_overall_level] [NVARCHAR](MAX) NULL,
            [commodity_threat_overall_score] [NVARCHAR](MAX) NULL,
            [commodity_value_forest_extent_level] [NVARCHAR](MAX) NULL,
            [commodity_value_peat_level] [NVARCHAR](MAX) NULL,
            [commodity_value_protected_areas_level] [NVARCHAR](MAX) NULL,
            [commodity_value_overall_level] [NVARCHAR](MAX) NULL,
            [commodity_value_overall_score] [NVARCHAR](MAX) NULL,
            [commodity_value_forest_extent] [NVARCHAR](MAX) NULL,
            [commodity_value_peat] [NVARCHAR](MAX) NULL,
            [commodity_value_protected_areas] [NVARCHAR](MAX) NULL,
            [commodity_mill_priority_level] [NVARCHAR](MAX) NULL,
            [commodity_mill_priority_score] [NVARCHAR](MAX) NULL,
            [commodity_threat_deforestation] [NVARCHAR](MAX) NULL,
            [commodity_threat_peat] [NVARCHAR](MAX) NULL,
            [commodity_threat_protected_areas] [NVARCHAR](MAX) NULL,
            [commodity_threat_fires] [NVARCHAR](MAX) NULL,
            [dissolved_data_location_info] [NVARCHAR](300) NULL
            ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
            """

    cursor.execute(create_table_sql)

    return

def data_cleaning(df):
    """
    Preps data for transfer to DB

    Params:
        df: Analysis results in dataframe

    Returns:
        Dataframe with cleaned values
    """
    mask = df.applymap(type) != bool
    d = {True: 'true', False: 'false'}
    df = df.where(mask, df.replace(d))

    df = df[df['location_id'] != -1]
    df['location_status_id'] = 2
    df['id'] = df.index

    df = df[cfg.small_lists_columns]

    return df

if __name__ == "__main__":
    # Connect to the db
    print("Connecting to DB")
    connection = pyodbc.connect(cfg.conn_string)
    print("Connected")

    match cfg.list_number:
        case 2:
            table_name = "analysis-oilPalmConcessions_new"
        case 3:
            table_name = "analysis-palmOilMills_new"
        case 5:
            table_name = "analysis-rspoOilPalmConcessions_new"
        case _:
            print("Invalid list number, failed to create temp table")
            sys.exit(1)
    
    print(f"Creating {table_name}")
    create_table(connection, table_name)

    # Load and clean the CSV
    print("Loading CSV data")
    df = pd.read_csv(cfg.analysis_path, sep="\t")
    print("Cleaning CSV data")
    df = data_cleaning(df)

    # Insert the data
    print("Inserting data")
    with connection:
        cursor = connection.cursor()
        updated_rows = 0

        for index, row in df.iterrows():
            sql_insert = f'INSERT INTO [dbo].[{table_name}]({",".join(cfg.small_lists_columns)}​​​​​​​​​​​​​​​​) VALUES ({",".join(["?"] * len(cfg.small_lists_columns))})'

            cursor.execute(sql_insert, row.values.tolist())
            updated_rows += 1

    print(f"Finished. Rows updated: {updated_rows}")