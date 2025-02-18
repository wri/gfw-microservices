/**
 * @param table_name NVARCHAR(150)
 */
export const dropOrganizationTable = `
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)

SET @TEMPLATE = 'DROP TABLE IF EXISTS [{TABLE_NAME}]'
SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @table_name)
EXEC sp_executesql @SQL`;
