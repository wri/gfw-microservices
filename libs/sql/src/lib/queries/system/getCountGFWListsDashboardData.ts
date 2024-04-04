/**
 * Count the number of records an specific gfw list has in the dashboard table, used for pagination
 * The command requires the following parameters:
 * @listId AS INT,
 */

export const getCountGFWListsDashboardData = `
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
  SET NOCOUNT ON;

DECLARE @list_table_name NVARCHAR(150)

SELECT @list_table_name = list_table_name FROM dbo.GFWLists WHERE id = @listId

DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)
SET @TEMPLATE = '
SELECT COUNT(*) as quantity
FROM dbo.[Analyses-Dashboard] AD
LEFT JOIN dbo.[list-administrativeAreas] AA ON AA.gadmid = AD.gadm_id
LEFT JOIN (SELECT * FROM gfwpro.dbo.[list-administrativeAreas] WHERE [Sub State] IS NULL) S ON S.Country = AA.Country AND S.State = AA.State
LEFT JOIN (SELECT * FROM gfwpro.dbo.[list-administrativeAreas] WHERE State IS NULL) C ON C.Country = AA.Country
LEFT JOIN (SELECT [Location Name] AS location_name, location_id, longitude AS location_lon, latitude AS location_lat FROM [{LIST_TABLE}]) L ON L.location_id = AD.location_id
WHERE AD.list_id = {LIST_ID}
'
SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}', @listId)
SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @list_table_name)

EXEC sp_executesql @SQL;
`;
