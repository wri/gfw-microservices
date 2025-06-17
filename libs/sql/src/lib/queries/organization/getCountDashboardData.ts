/**
 * Count the number of records an specific list has in the dashboard, used for pagination
 * The command requires the following parameters:
 * @listId AS INT,
 */

export const getCountDashboardData = `
-- SET NOCOUNT ON added to prevent extra result sets from
 -- interfering with SELECT statements.
 SET NOCOUNT ON;

 DECLARE @template_id INT
 DECLARE @name_field NVARCHAR(50)
 DECLARE @list_table_name NVARCHAR(150)

 SELECT @list_table_name = list_table_name, @template_id = template_id FROM dbo.Lists WHERE id = @listId
 SET @name_field = CASE WHEN @template_id = 1 THEN '[Investment Name]' ELSE '[Location Name]' END

 DECLARE @TEMPLATE NVARCHAR(MAX)
 DECLARE @SQL NVARCHAR(MAX)
 SET @TEMPLATE = '
  SELECT COUNT(*) as quantity
  FROM dbo.[Analyses-Dashboard] AD
  OUTER APPLY (
    SELECT TOP 1 gadmid, [Country], [State], [Sub State], [Location Name], Latitude, Longitude
    FROM (
      SELECT gadmid, [Country], [State], [Sub State], [Location Name], Latitude, Longitude
      FROM gfwpro.dbo.[list-administrativeAreas41]
      WHERE gadmid = AD.gadm_id AND AD.gadm_id LIKE ''4%''

      UNION ALL

      SELECT gadmid, [Country], [State], [Sub State], [Location Name], Latitude, Longitude
      FROM gfwpro.dbo.[list-administrativeAreas36]
      WHERE gadmid = AD.gadm_id AND AD.gadm_id NOT LIKE ''4%''
    ) AS CombinedAA
  ) AS AA

  OUTER APPLY (
    SELECT TOP 1 gadmid, Latitude, Longitude
    FROM (
      SELECT gadmid, Country, State, Latitude, Longitude
      FROM gfwpro.dbo.[list-administrativeAreas41]
      WHERE [Sub State] IS NULL AND AD.gadm_id LIKE ''4%''

      UNION ALL

      SELECT gadmid, Country, State, Latitude, Longitude
      FROM gfwpro.dbo.[list-administrativeAreas36]
      WHERE [Sub State] IS NULL AND AD.gadm_id NOT LIKE ''4%''
    ) AS CombinedS
    WHERE CombinedS.Country = AA.Country AND CombinedS.State = AA.State
  ) AS S

  OUTER APPLY (
    SELECT TOP 1 gadmid, Latitude, Longitude
    FROM (
      SELECT gadmid, Country, Latitude, Longitude
      FROM gfwpro.dbo.[list-administrativeAreas41]
      WHERE State IS NULL AND AD.gadm_id LIKE ''4%''

      UNION ALL

      SELECT gadmid, Country, Latitude, Longitude
      FROM gfwpro.dbo.[list-administrativeAreas36]
      WHERE State IS NULL AND AD.gadm_id NOT LIKE ''4%''
    ) AS CombinedC
    WHERE CombinedC.Country = AA.Country
  ) AS C
  LEFT JOIN (SELECT {NAME_FIELD} AS location_name, location_id, longitude AS location_lon, latitude AS location_lat FROM [{LIST_TABLE}]) L ON L.location_id = AD.location_id
  WHERE AD.list_id = {LIST_ID}
 '
  SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}', @listId)
  SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @list_table_name)
  SET @SQL = REPLACE(@SQL, '{NAME_FIELD}', @name_field)

  EXEC sp_executesql @SQL;
`;

export interface CountDashboardDataType {
  quantity: number;
}
