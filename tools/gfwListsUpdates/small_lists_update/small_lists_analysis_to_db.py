import sys
import pyodbc
import pandas as pd
import small_lists_config as cfg
from utils_commodity import addCommodityLevels

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
                [location_id] [int] NULL,
                [location_status_id] [int] NOT NULL,
                [tree_cover_loss_total_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_primary_forest_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_peat_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_intact_forest_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_protected_areas_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_sea_landcover_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_idn_landcover_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_idn_primary_forest_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_soy_yearly] [nvarchar](2000) NULL,
                [tree_cover_loss_idn_legal_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_idn_forest_moratorium_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_prodes_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_prodes_wdpa_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_prodes_primary_forest_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_brazil_biomes_yearly] [nvarchar](max) NULL,
                [tree_cover_extent_total] [decimal](18, 6) NULL,
                [tree_cover_extent_primary_forest] [decimal](18, 6) NULL,
                [tree_cover_extent_protected_areas] [decimal](18, 6) NULL,
                [tree_cover_extent_peat] [decimal](18, 6) NULL,
                [tree_cover_extent_intact_forest] [decimal](18, 6) NULL,
                [natural_habitat_primary] [decimal](18, 6) NULL,
                [natural_habitat_intact_forest] [decimal](18, 6) NULL,
                [natural_habitat_global_land_cover] [nvarchar](max) NULL,
                [total_area] [decimal](18, 6) NULL,
                [protected_areas_area] [decimal](18, 6) NULL,
                [critical_habitat_alliance_zero] [decimal](18, 6) NULL,
                [indigenous_people_land_rights] [decimal](18, 6) NULL,
                [peat_area] [decimal](18, 6) NULL,
                [fires_counts_monthly] [nvarchar](max) NULL,
                [soy_total_area] [nvarchar](max) NULL,
                [soy_pre2001_nonforest_area] [decimal](18, 6) NULL,
                [brazil_biomes] [nvarchar](max) NULL,
                [idn_legal_area] [nvarchar](max) NULL,
                [sea_landcover_area] [nvarchar](max) NULL,
                [idn_landcover_area] [nvarchar](max) NULL,
                [idn_forest_moratorium_area] [decimal](18, 6) NULL,
                [south_america_presence] [nvarchar](50) NULL,
                [legal_amazon_presence] [nvarchar](50) NULL,
                [brazil_biomes_presence] [nvarchar](50) NULL,
                [cerrado_biome_presence] [nvarchar](50) NULL,
                [southeast_asia_presence] [nvarchar](50) NULL,
                [indonesia_presence] [nvarchar](50) NULL,
                [commodity_threat_deforestation_level] [nvarchar](max) NULL,
                [commodity_threat_peat_level] [nvarchar](max) NULL,
                [commodity_threat_protected_areas_level] [nvarchar](max) NULL,
                [commodity_threat_fires_level] [nvarchar](max) NULL,
                [commodity_threat_overall_level] [nvarchar](max) NULL,
                [commodity_threat_overall_score] [nvarchar](max) NULL,
                [commodity_value_forest_extent_level] [nvarchar](max) NULL,
                [commodity_value_peat_level] [nvarchar](max) NULL,
                [commodity_value_protected_areas_level] [nvarchar](max) NULL,
                [commodity_value_overall_level] [nvarchar](max) NULL,
                [commodity_value_overall_score] [nvarchar](max) NULL,
                [commodity_value_forest_extent] [nvarchar](max) NULL,
                [commodity_value_peat] [nvarchar](max) NULL,
                [commodity_value_protected_areas] [nvarchar](max) NULL,
                [commodity_mill_priority_level] [nvarchar](max) NULL,
                [commodity_mill_priority_score] [nvarchar](max) NULL,
                [commodity_threat_deforestation] [nvarchar](max) NULL,
                [commodity_threat_peat] [nvarchar](max) NULL,
                [commodity_threat_protected_areas] [nvarchar](max) NULL,
                [commodity_threat_fires] [nvarchar](max) NULL,
                [dissolved_data_location_info] [nvarchar](300) NULL,
                [id] [int] NOT NULL,
                [tree_cover_loss_arg_otbn_yearly] [nvarchar](max) NULL,
                [arg_otbn_area] [nvarchar](max) NULL,
                [protected_areas_by_category_area] [nvarchar](max) NOT NULL,
                [landmark_by_category_area] [nvarchar](max) NOT NULL,
                [country_specific_deforestation_yearly] [nvarchar](max) NULL,
                [country_specific_deforestation_wdpa_yearly] [nvarchar](max) NULL,
                [country_specific_deforestation_landmark_yearly] [nvarchar](max) NULL,
                [country_specific_deforestation_classified_region_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_by_country_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_by_country_wdpa_yearly] [nvarchar](max) NULL,
                [tree_cover_loss_by_country_landmark_yearly] [nvarchar](max) NULL,
                [country_area] [nvarchar](max) NULL,
                [classified_region_area] [nvarchar](max) NULL,
                [tree_cover_loss_by_country_classified_region_yearly] [nvarchar](max) NULL
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
    # Columns that will be calculated by addCommodityLevels
    commodity_cols = [
        'commodity_threat_deforestation_level',
        'commodity_threat_peat_level',
        'commodity_threat_protected_areas_level',
        'commodity_threat_fires_level',
        'commodity_threat_overall_level',
        'commodity_threat_overall_score',
        'commodity_value_forest_extent_level',
        'commodity_value_peat_level',
        'commodity_value_protected_areas_level',
        'commodity_value_overall_level',
        'commodity_value_overall_score',
        'commodity_mill_priority_level',
        'commodity_mill_priority_score'
    ]

    # Add and remove columns
    all_cols = cfg.small_lists_columns + commodity_cols
    df = df.reindex(columns=all_cols)

    # Convert booleans to text
    mask = df.applymap(type) != bool
    d = {True: 'true', False: 'false'}
    df = df.where(mask, df.replace(d))

    # Populate columns
    df = df[df['location_id'] != -1]
    df['location_status_id'] = 2
    df['id'] = df.index

    return df

if __name__ == "__main__":
    # Load CSV data
    print("Loading CSV data")
    df = pd.read_csv(cfg.analysis_path, sep="\t")

    # Connect to the db
    print("Connecting to DB")
    connection = pyodbc.connect(cfg.conn_string)
    print("Connected")

    if cfg.list_number == 2:
        table_name = "analysis-oilPalmConcessions_new"
    elif cfg.list_number == 3:
        table_name = "analysis-palmOilMills_new"
        df = addCommodityLevels(df)
    elif cfg.list_number == 5:
        table_name = "analysis-rspoOilPalmConcessions_new"
    else:
        print("Invalid list number, failed to create temp table")
        sys.exit(1)

    # Clean CSV data
    print("Cleaning CSV data")
    df = data_cleaning(df)

    print(f"Creating {table_name}")
    create_table(connection, table_name)

    # Insert the data
    print("Inserting data")
    with connection:
        cursor = connection.cursor()
        updated_rows = 0
        
        # Combine columns for the INSERT statement
        all_db_columns = cfg.small_lists_columns + [col for col in df.columns if col.startswith('commodity_')]
        column_list_for_sql = ",".join(all_db_columns)
        placeholders = ",".join(["?"] * len(all_db_columns))
        sql_insert = f'INSERT INTO [dbo].[{table_name}]({column_list_for_sql}) VALUES ({placeholders})'

        for index, row in df.iterrows():
            cursor.execute(sql_insert, row[all_db_columns].values.tolist())
            updated_rows += 1

    print(f"Finished. Rows updated: {updated_rows}")
