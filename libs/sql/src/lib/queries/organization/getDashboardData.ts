/**
 * The query returns the dashboard data for a list.
 * The command requires the following parameters:
 * @listID AS INT,
 */
export const getDashboardData = `
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
  SELECT AD.list_id,
   AD.location_id,
   AD.gadm_id,
   AD.glad_alerts_coverage AS gladAlerts,
   AD.glad_alerts_daily,
   AD.glad_alerts_weekly,
   AD.glad_alerts_monthly,
   AD.viirs_alerts_daily,
   AD.tree_cover_extent_total,
   AA.[Country],
   AA.[State],
   AA.[Sub State],
   AA.[Location Name] AS name_all,
   AA.[gadmid],
   AA.gadmid AS gadmid_2,
   AA.Latitude AS gadmid_2_lat, AA.Longitude AS gadmid_2_lon,
   S.gadmid AS gadmid_1, S.Latitude AS gadmid_1_lat, S.Longitude AS gadmid_1_lon,
   C.gadmid AS gadmid_0, C.Latitude AS gadmid_0_lat, C.Longitude AS gadmid_0_lon,
   L.location_lat, L.location_lon,
   L.location_name
  FROM dbo.[Analyses-Dashboard] AD
  LEFT JOIN gfwpro.dbo.[list-administrativeAreas] AA ON AA.gadmid = AD.gadm_id
  LEFT JOIN (SELECT * FROM gfwpro.dbo.[list-administrativeAreas] WHERE [Sub State] IS NULL) S ON S.Country = AA.Country AND S.State = AA.State
  LEFT JOIN (SELECT * FROM gfwpro.dbo.[list-administrativeAreas] WHERE State IS NULL) C ON C.Country = AA.Country
  LEFT JOIN (SELECT {NAME_FIELD} AS location_name, location_id, longitude AS location_lon, latitude AS location_lat FROM [{LIST_TABLE}]) L ON L.location_id = AD.location_id
  WHERE AD.list_id = {LIST_ID}
  ORDER BY AD.location_id
 '
    SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}', @listId)
 SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @list_table_name)
 SET @SQL = REPLACE(@SQL, '{NAME_FIELD}', @name_field)

    EXEC sp_executesql @SQL;
`;

export interface DashboardDataType {
  list_id: number;
  location_id: number;
  gadm_id: string;
  gladAlerts: string;
  glad_alerts_daily: string;
  glad_alerts_weekly: string;
  glad_alerts_monthly: string;
  viirs_alerts_daily: string;
  tree_cover_extent_total: number;
  Country: string;
  State: string;
  'Sub State': string;
  name_all: string;
  gadmid: string;
  gadmid_2: string;
  gadmid_2_lat: number;
  gadmid_2_lon: number;
  gadmid_1: string;
  gadmid_1_lat: number;
  gadmid_1_lon: number;
  gadmid_0: string;
  gadmid_0_lat: number;
  gadmid_0_lon: number;
  location_lat: number;
  location_lon: number;
  location_name: string;
  fire?: string;
  fireAlerts?: boolean;
  umd?: number;
}
