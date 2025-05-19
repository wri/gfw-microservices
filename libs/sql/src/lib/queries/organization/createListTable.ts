/**
 * @param query_string NVARCHAR(MAX)
 */
export const createListTable = `
DECLARE @SQL NVARCHAR(MAX)
SET @SQL = 'CREATE TABLE [' + @table_name + '] (
  location_id INT NOT NULL PRIMARY KEY,
  ' + @query_string + ',
  INDEX [IX_' + @table_name + '] NONCLUSTERED(location_id)
)'
EXEC sp_executesql @SQL
`;
