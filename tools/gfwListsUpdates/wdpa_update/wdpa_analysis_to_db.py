import pandas as pd
import sqlalchemy as sal
import wdpa_config as cfg
import name_conversion_dict as db_names

def cleanData(df):
    """
    Performs column name mapping operations

    Args:
        df  : Dataframe containing unaltered output from geotrellis

    Return:
        Dataframe with columns matching Dec 2023 DB schema
    """

    # Drop extra cols
    df = df.drop(
        [
            "location_error",
            "tree_cover_loss_arg_otbn_yearly",
            "tree_cover_extent_primary_forest",
            "protected_areas_by_category_area",
            "landmark_by_category_area",
        ],
        axis=1,
    )

    # Rename cols
    df = df.rename(columns=db_names.col_names_dict)

    # Add missing cols
    for col in list(db_names.db_schema_dict.keys()):
        if col not in df.columns:
            df[col] = None

    # Reorder columns
    df = df[list(db_names.db_schema_dict.keys())]

    return df

def boolConvert(df):
    """
    Converts boolean values to text equivalents

    Args:
        df  : Dataframe with boolean values and columns matching DB schema

    Return:
        Dataframe with boolean values replaced with text equivalents
    """

    mask = df.applymap(type) != bool
    d = {True: "true", False: "false"}
    df = df.where(mask, df.replace(d))

    return df

def nvarcharConvert(df):
    """
    Converts null data in columns that will be NVARCHAR to default "{}"

    Args:
        df  : Dataframe with colummns matching DB schema

    Return:
        Dataframe with no "NULL" values in cols that will be NVARCHAR in the DB
    """

    # Create a list of columns that contain NVARCHAR datatype
    nvarchar_cols = [
        k
        for k, v in db_names.db_schema_dict.items()
        if "NVARCHAR" in str(v)
    ]

    # Replace None values with {} in NVARCHAR columns
    for column in nvarchar_cols:
        df[column].fillna("{}", inplace=True)

    return df

if __name__ == "__main__":
    """This is executed when run from the command line"""

    # Connect to the database
    conn_string = cfg.sal_string
    engine = sal.create_engine(conn_string)
    conn = engine.connect()
    print("Connected to DB")

    # Create df with all original location ids from db
    loc_id_sql = "SELECT [location_id] FROM [gfwpro].[dbo].[list-protectedAreas_import]"
    loc_id_df = pd.read_sql(loc_id_sql, conn)
    print("Retrieved location_id data from database")

    # Read csv to df
    file_path = cfg.processed_csv
    input_df = pd.read_csv(file_path, sep="\t")
    print("Read input data")

    # Merge dataframes
    merged_df = pd.merge(loc_id_df, input_df, on="location_id", how="outer")
    print("Created merged dataframe")

    # Clean input_df
    merged_df = cleanData(merged_df)
    print("Cleaned dataframe columns")

    # Replace boolean values with string
    merged_df = boolConvert(merged_df)
    print("Converted bool values")

    # Replace null nvarchar values with {}
    merged_df = nvarcharConvert(merged_df)
    print("Converted nvarchar values")

    # Save to database
    print("Saving dataframe to database")
    merged_df.to_sql(
        "analysis-protectedAreas_import",
        conn,
        index=False,
        if_exists="replace",
        dtype=db_names.db_schema_dict,
    )

    print("Done")
