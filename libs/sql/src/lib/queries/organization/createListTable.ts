/**
 * @param query_string NVARCHAR(MAX)
 */
export const createListTable = `
DECLARE @SQL NVARCHAR(MAX)
SET @SQL = 'CREATE TABLE [' + @table_name + '] (
  location_id INT PRIMARY KEY,
  ' + @query_string + '
)'
EXEC sp_executesql @SQL
`;
