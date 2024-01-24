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
  LEFT JOIN gfwpro.dbo.[list-administrativeAreas] AA ON AA.gadmid = AD.gadm_id
  LEFT JOIN (SELECT * FROM gfwpro.dbo.[list-administrativeAreas] WHERE [Sub State] IS NULL) S ON S.Country = AA.Country AND S.State = AA.State
  LEFT JOIN (SELECT * FROM gfwpro.dbo.[list-administrativeAreas] WHERE State IS NULL) C ON C.Country = AA.Country
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
