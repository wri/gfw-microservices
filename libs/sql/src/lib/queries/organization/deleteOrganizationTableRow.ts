/**
 * @param table_name NVARCHAR(150)
 * @param primary_key INT
 * @param column NVARCHAR(150)
 */
export const deleteOrganizationTableRow = `
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)

SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE {COLUMN} = {PRIMARY_KEY}'
SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @table_name)
SET @SQL = REPLACE(@SQL, '{COLUMN}', @column)
SET @SQL = REPLACE(@SQL, '{PRIMARY_KEY}', @primary_key)
EXEC sp_executesql @SQL`;
