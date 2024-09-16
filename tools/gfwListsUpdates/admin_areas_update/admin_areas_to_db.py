import pandas as pd
import sqlalchemy as sal
import admin_config as cfg

# Data cleaning
def cleanData(new_dataframe, location_id_dataframe, column_name_dataframe):
    """
    Prepares the data for storage in DB

    Params:
        new_dataframe: Input data
        location_id_dataframe: Dataframe containing location_id values
        column_name_dataframe: Dataframe containing target column names

    Return:
        Dataframe with all data consolidated
    """
    # Find extra location_ids
    old_locs = set(location_id_dataframe['location_id'])
    new_locs = set(new_dataframe['location_id'])
    extra_locs = new_locs - old_locs

    # Remove extra rows
    output_dataframe = new_dataframe[~new_dataframe['location_id'].isin(extra_locs)]

    # Drop extra cols
    output_dataframe = output_dataframe.drop(['list_id', 'location_error'], axis=1)

    # Rename cols
    output_dataframe = output_dataframe.rename({'status_code':'location_status_id'}, axis=1)

    # Create id col
    output_dataframe.insert(0, 'id', output_dataframe.index)

    # Get missing cols
    old_cols = set(column_name_dataframe.columns.values.tolist())
    new_cols = set(output_dataframe.columns.values.tolist())
    missing_cols = old_cols - new_cols

    # Add missing cols
    for col in missing_cols:
        output_dataframe[col] = None

    # Reorder columns
    output_dataframe = output_dataframe[list(cfg.admin_areas_db_schema.keys())]
    
    return output_dataframe

def boolConvert(clean_dataframe):
    """
    Replaces (bool) True with (str) 'true' 

    Params:
        clean_dataframe: DF with bool values
    
    Returns:
        DF with bools converted to string
    """
    mask = clean_dataframe.applymap(type) != bool
    d = {True: 'true', False: 'false'}
    clean_dataframe = clean_dataframe.where(mask, clean_dataframe.replace(d))

    return clean_dataframe

def cleanNvarchar(cleaned_dataframe):
    """
    Replace empty nvarchar with {}
    
    Params:
        cleaned_dataframe: DF with empty values
    
    Returns:
        DF with {} instead of null strings
    """
    # Create a list of columns that contain NVARCHAR datatype
    nvarchar_cols = [k for k, v in cfg.admin_areas_db_schema.items() if 'NVARCHAR' in str(v)]

    # Replace None values with {} in NVARCHAR columns
    for column in nvarchar_cols:
        cleaned_dataframe[column].fillna(r'{}', inplace=True)

    return cleaned_dataframe

def main(connection, current_table, in_file):
    """
    Saves data to DB

    Params:
        connection: SQLAlchemy connection file
        current_table: String target table name
        in_file: Path to new data CSV
    """
    print(f'working on {current_table}')

    # Get original col names
    col_sql = f"SELECT TOP (1) * FROM dbo.[{current_table}]"
    col_df = pd.read_sql(col_sql, connection)
    print("loaded column name dataframe")

    # Get original location_ids
    loc_sql = f"SELECT [location_id] FROM dbo.[{current_table}]"
    loc_df = pd.read_sql(loc_sql, connection)
    print("loaded location_id dataframe")

    # Read new data from .tsv
    new_df = pd.read_csv(in_file, sep='\t')
    print("loaded new data dataframe")

    # Clean new_df
    clean_df = cleanData(new_df, loc_df, col_df)
    print("cleanData() complete")

    # Replace boolean values with string
    clean_df = boolConvert(clean_df)
    print("boolConvert() complete")

    # Replaces None values with {} in NVARCHAR data type cols
    clean_df = cleanNvarchar(clean_df)
    print("cleanNvarchar() complete")

    print("saving dataframe to database")
    clean_df.to_sql(f'{current_table}_new',
                    conn, index=False,
                    if_exists='replace',
                    dtype=cfg.admin_areas_db_schema
                    )

    return

if __name__ == "__main__":
    """ This is executed when run from the command line """

    engine = sal.create_engine(cfg.sal_string)
    conn = engine.connect()
    print("connected to db")
    
    main(conn, 'analysis-administrativeAreas', cfg.admin_analysis_data)

    print("done")