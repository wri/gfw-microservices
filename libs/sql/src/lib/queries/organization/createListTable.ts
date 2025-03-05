/**
 * @param query_string NVARCHAR(MAX)
 */
export const createListTable = `
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)

SET @TEMPLATE = ''''CREATE TABLE [{TABLE_NAME}] ({QUERY_STRING}, INDEX [IX_{TABLE_NAME}] NONCLUSTERED(location_id))''''

SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', @table_name)
SET @SQL = REPLACE(@SQL, ''''{QUERY_STRING}'''', @query_string)
EXEC sp_executesql @SQL
`;
