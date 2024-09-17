import pyodbc
import pandas as pd
import small_lists_config as cfg

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

    df = df.rename(columns={"status_code": "status_id"})

    return df

def get_items_to_update(df):
    """
    Determines which items require updates
    
    Params:
        df: Analysis results in dataframe

    Returns:
        List of values to update
    """
    df_list_level_results = df[df['location_id'] == -1]

    df_list_level_values_to_update = df_list_level_results[cfg.small_lists_list_level_columns].values.tolist()[0]

    return df_list_level_values_to_update

if __name__ == "__main__":
    # Connect to the db
    print("Connecting to DB")
    connection = pyodbc.connect(cfg.conn_string)
    print("Connected")

    # Load and clean the CSV
    print("Loading CSV data")
    df = pd.read_csv(cfg.analysis_path, sep="\t")

    print("Cleaning CSV data")
    df = data_cleaning(df)

    print("Getting items to updates")
    items_to_update = get_items_to_update(df)

    print("Updating GFWAnalysis table")
    with connection:
        cursor = connection.cursor()
        cursor.fast_executemany = True
        set_tokens = ','.join([f'"{x}"=?' for x in cfg.small_lists_list_level_columns[:-1]])
        sql = f'UPDATE dbo.[GFWAnalyses] SET {set_tokens} WHERE list_id=?'
        cursor.execute(sql, items_to_update)

    print("Finished")