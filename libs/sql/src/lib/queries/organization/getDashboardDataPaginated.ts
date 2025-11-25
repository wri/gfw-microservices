/**
 * Returns the dashboard data for user list paginated
 *
 * @listId INT - id of the list
 * @pageNumber INT - page that we want to get
 * @rowsPerPage INT - number of rows per page
 *
 * Returns type DashboardDataType (same as getDashboardData)
 */
export const getDashboardDataPaginated = `
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
  SELECT
    AD.list_id,
    AD.location_id,
    AD.gadm_id,
    AD.glad_alerts_coverage AS gladAlerts,
    AD.glad_alerts_daily,
    AD.glad_alerts_weekly,
    AD.glad_alerts_monthly,
    AD.viirs_alerts_daily,
    AD.tree_cover_extent_total,
    AD.integrated_alerts_coverage AS integratedAlertsCoverage,
    AD.integrated_alerts_daily_all_nominal AS integratedAlertsDailyAllNominal,
    AD.integrated_alerts_daily_all_high AS integratedAlertsDailyAllHigh,
    AD.integrated_alerts_daily_all_highest AS integratedAlertsDailyAllHighest,
    AD.integrated_alerts_daily_sbtn_nominal AS integratedAlertsDailySbtnNominal,
    AD.integrated_alerts_daily_sbtn_high AS integratedAlertsDailySbtnHigh,
    AD.integrated_alerts_daily_sbtn_highest AS integratedAlertsDailySbtnHighest,
    AD.integrated_alerts_daily_jrc_nominal AS integratedAlertsDailyJrcNominal,
    AD.integrated_alerts_daily_jrc_high AS integratedAlertsDailyJrcHigh,
    AD.integrated_alerts_daily_jrc_highest AS integratedAlertsDailyJrcHighest,
    AD.intdist_alerts_area_all_nominal AS integratedAlertsAreaAllNominal,
    AD.intdist_alerts_area_all_high AS integratedAlertsAreaAllHigh,
    AD.intdist_alerts_area_all_highest AS integratedAlertsAreaAllHighest,
    AD.intdist_alerts_area_sbtn_natural_forests_nominal AS integratedAlertsAreaSbtnNaturalForestsNominal,
    AD.intdist_alerts_area_sbtn_natural_forests_high AS integratedAlertsAreaSbtnNaturalForestsHigh,
    AD.intdist_alerts_area_sbtn_natural_forests_highest AS integratedAlertsAreaSbtnNaturalForestsHighest,
    AD.intdist_alerts_area_sbtn_natural_ecosystem_nominal AS integratedAlertsAreaSbtnNaturalEcosystemNominal,
    AD.intdist_alerts_area_sbtn_natural_ecosystem_high AS integratedAlertsAreaSbtnNaturalEcosystemHigh,
    AD.intdist_alerts_area_sbtn_natural_ecosystem_highest AS integratedAlertsAreaSbtnNaturalEcosystemHighest,
    AD.intdist_alerts_area_jrc_nominal AS integratedAlertsAreaJrcNominal,
    AD.intdist_alerts_area_jrc_high AS integratedAlertsAreaJrcHigh,
    AD.intdist_alerts_area_jrc_highest AS integratedAlertsAreaJrcHighest,
    AA.[Country],
    AA.[State],
    AA.[Sub State],
    AD.total_ha AS totalHa,
    AA.[Location Name] AS name_all,
    AA.gadmid,
    AA.gadmid AS gadmid_2,
    AA.Latitude AS gadmid_2_lat, AA.Longitude AS gadmid_2_lon,
    S.gadmid AS gadmid_1, S.Latitude AS gadmid_1_lat, S.Longitude AS gadmid_1_lon,
    C.gadmid AS gadmid_0, C.Latitude AS gadmid_0_lat, C.Longitude AS gadmid_0_lon,
    L.location_lat, L.location_lon,
    L.location_name
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

  LEFT JOIN (
    SELECT {NAME_FIELD} AS location_name, location_id, longitude AS location_lon, latitude AS location_lat
    FROM [{LIST_TABLE}]
  ) L ON L.location_id = AD.location_id

  WHERE AD.list_id = {LIST_ID}
  ORDER BY AD.location_id
  OFFSET {PAGE_NUMBER} * {ROW_PER_PAGE} ROWS FETCH NEXT {ROW_PER_PAGE} ROWS ONLY
 '
  SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}', @listId)
  SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @list_table_name)
  SET @SQL = REPLACE(@SQL, '{NAME_FIELD}', @name_field)
  SET @SQL = REPLACE(@SQL, '{PAGE_NUMBER}', @pageNumber)
  SET @SQL = REPLACE(@SQL, '{ROW_PER_PAGE}', @rowsPerPage)

  EXEC sp_executesql @SQL;
`;
export class DashboardDataPaginated {
  list_id: number;
  location_id: number;
  gadm_id: number;
  glad_alerts_coverage: string;
  glad_alerts_daily: string;
  glad_alerts_weekly: string;
  glad_alerts_monthly: string;
  viirs_alerts_daily: string;
  tree_cover_extent_total: number;
  integrated_alerts_coverage: string;
  total_ha: number;
  integrated_alerts_daily_all_nominal: string;
  integrated_alerts_daily_all_high: string;
  integrated_alerts_daily_all_highest: string;
  integrated_alerts_daily_sbtn_nominal: string;
  integrated_alerts_daily_sbtn_high: string;
  integrated_alerts_daily_sbtn_highest: string;
  integrated_alerts_daily_jrc_nominal: string;
  integrated_alerts_daily_jrc_high: string;
  integrated_alerts_daily_jrc_highest: string;
  status_code: number;
}
