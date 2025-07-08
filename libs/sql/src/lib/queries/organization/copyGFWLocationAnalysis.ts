/**
 * @param dest_list_id INT
 * @param dest_location_id INT
 * @param src_list_id INT
 * @param src_location_id INT
 * @param statement NVARCHAR(MAX)
 */
export const copyGFWLocationAnalysis = `
DECLARE @SRC_TABLE NVARCHAR(150)
DECLARE @DEST_TABLE NVARCHAR(150)
DECLARE @SQL NVARCHAR(MAX)

SET @SRC_TABLE = (SELECT list_analysis_table_name FROM gfwpro.dbo.Lists WHERE id = @src_list_id)
SET @DEST_TABLE = (SELECT list_analysis_table_name FROM Lists WHERE id = @dest_list_id)

SET @SQL = '
    UPDATE [{DEST_TABLE}]
    SET {STATEMENT}
    FROM gfwpro.dbo.[{SRC_TABLE}]
    WHERE gfwpro.dbo.[{SRC_TABLE}].location_id = {SRC_LOCATION_ID} AND [{DEST_TABLE}].location_id = {DEST_LOCATION_ID}
'

SET @SQL = REPLACE(@SQL, '{DEST_TABLE}', @DEST_TABLE)
SET @SQL = REPLACE(@SQL, '{SRC_TABLE}', @SRC_TABLE)
SET @SQL = REPLACE(@SQL, '{STATEMENT}', @statement)
SET @SQL = REPLACE(@SQL, '{SRC_LOCATION_ID}', @src_location_id)
SET @SQL = REPLACE(@SQL, '{DEST_LOCATION_ID}', @dest_location_id)
EXEC sp_executesql @SQL

SET @SQL = '
    UPDATE [{DEST_TABLE}]
    SET location_status_id = 3
    WHERE location_status_id = 1
'
SET @SQL = REPLACE(@SQL, '{DEST_TABLE}', @DEST_TABLE)
EXEC sp_executesql @SQL
`;
