/**
 * @param list_id INT
 */
export const getCheckIfListsHasAnyIdType = `
DECLARE @sql        NVARCHAR(MAX);
DECLARE @list_table_name NVARCHAR(MAD);

SELECT @list_table_name = [list_table_name] FROM dbo.[Lists] WHERE id = @list_id

SET @sql = N'
SELECT
  CASE
      WHEN EXISTS (
          SELECT 1
          FROM   ' + QUOTENAME(@list_table_name) + N'
          WHERE  JSON_VALUE([attributes],''$.["ID Type"]'') IS NOT NULL
             OR JSON_VALUE([attributes],''$.ID'')          IS NOT NULL
      )
      THEN CAST(1 AS bit)
      ELSE CAST(0 AS bit)
  END AS list_has_ids;';

EXEC sp_executesql @sql;
`;

export type checkIfListsHasIds = {
  list_has_ids: boolean
}