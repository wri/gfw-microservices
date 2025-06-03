/**
 * @param query_string NVARCHAR(MAX)
 */
export const createListTable = `
DECLARE @SQL NVARCHAR(MAX)
SET @SQL = 'CREATE TABLE [' + @table_name + '] (
  ' + @query_string + '
)'
EXEC sp_executesql @SQL
`;
