/**
 * @list_id INT
 * @location_id INT
 * @statement NVARCHAR(MAX)
 */
export const editLocation = `
DECLARE @LIST_TABLE NVARCHAR(150)
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)

SET @LIST_TABLE = (
	SELECT list_table_name
	FROM Lists
	WHERE id = @list_id
)

SET @TEMPLATE = '
	UPDATE [{TABLE}]
	SET {STATEMENT}
	WHERE location_id = {LOCATION_ID}
'

SET @SQL = REPLACE(@TEMPLATE, '{TABLE}', @LIST_TABLE)
SET @SQL = REPLACE(@SQL, '{STATEMENT}', @statement)
SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
EXEC sp_executesql @SQL

`;
