/**
 * Returns the dashboard data for a GFW List using pagination
 *
 * @listId INT - id of the list
 * @pageNumber INT - page that we want to get
 * @rowsPerPage INT - number of rows per page
 *
 * Returns type DashboardDataType (same as getDashboardData)
 *
 * NOTE: This query now parses JSON in SQL and returns numeric sums instead of JSON strings
 * for integrated alerts fields. This prevents RangeError issues in NodeJS when handling
 * large datasets with many dates.
 */
export const getGFWListsDashboardDataPaginated = `
  -- SET NOCOUNT ON added to prevent extra result sets from
  -- interfering with SELECT statements.
  SET NOCOUNT ON;

  DECLARE @list_table_name NVARCHAR(150)

  SELECT @list_table_name = list_table_name FROM dbo.GFWLists WHERE id = @listId

  DECLARE @TEMPLATE NVARCHAR(MAX)
  DECLARE @SQL NVARCHAR(MAX)
  
  -- Build CTE to parse and sum JSON alert data
  SET @TEMPLATE = '
    ;WITH ParsedAlerts AS (
      SELECT
        location_id,
        -- Parse and sum integrated_alerts_daily fields (count-based)
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(integrated_alerts_daily_all_nominal)), 0) AS integratedAlertsDailyAllNominal,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(integrated_alerts_daily_all_high)), 0) AS integratedAlertsDailyAllHigh,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(integrated_alerts_daily_all_highest)), 0) AS integratedAlertsDailyAllHighest,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(integrated_alerts_daily_sbtn_nominal)), 0) AS integratedAlertsDailySbtnNominal,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(integrated_alerts_daily_sbtn_high)), 0) AS integratedAlertsDailySbtnHigh,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(integrated_alerts_daily_sbtn_highest)), 0) AS integratedAlertsDailySbtnHighest,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(integrated_alerts_daily_jrc_nominal)), 0) AS integratedAlertsDailyJrcNominal,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(integrated_alerts_daily_jrc_high)), 0) AS integratedAlertsDailyJrcHigh,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(integrated_alerts_daily_jrc_highest)), 0) AS integratedAlertsDailyJrcHighest,
        -- Parse and sum intdist_alerts_area fields (hectare-based)
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_all_nominal)), 0) AS integratedAlertsAreaAllNominal,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_all_high)), 0) AS integratedAlertsAreaAllHigh,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_all_highest)), 0) AS integratedAlertsAreaAllHighest,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_sbtn_natural_forests_nominal)), 0) AS integratedAlertsAreaSbtnNaturalForestsNominal,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_sbtn_natural_forests_high)), 0) AS integratedAlertsAreaSbtnNaturalForestsHigh,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_sbtn_natural_forests_highest)), 0) AS integratedAlertsAreaSbtnNaturalForestsHighest,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_sbtn_natural_ecosystem_nominal)), 0) AS integratedAlertsAreaSbtnNaturalEcosystemNominal,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_sbtn_natural_ecosystem_high)), 0) AS integratedAlertsAreaSbtnNaturalEcosystemHigh,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_sbtn_natural_ecosystem_highest)), 0) AS integratedAlertsAreaSbtnNaturalEcosystemHighest,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_jrc_nominal)), 0) AS integratedAlertsAreaJrcNominal,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_jrc_high)), 0) AS integratedAlertsAreaJrcHigh,
        ISNULL((SELECT SUM(CAST([value] AS FLOAT)) FROM OPENJSON(intdist_alerts_area_jrc_highest)), 0) AS integratedAlertsAreaJrcHighest
      FROM dbo.[Analyses-Dashboard]
      WHERE list_id = {LIST_ID}
    )
    SELECT AD.list_id,
      AD.location_id,
      AD.gadm_id,
      AD.glad_alerts_coverage AS gladAlerts,
      AD.glad_alerts_daily,
      AD.glad_alerts_weekly,
      AD.glad_alerts_monthly,
      AD.viirs_alerts_daily,
      AD.tree_cover_extent_total,
      AD.integrated_alerts_coverage as integratedAlertsCoverage,
      -- Use parsed numeric values from CTE
      PA.integratedAlertsDailyAllNominal,
      PA.integratedAlertsDailyAllHigh,
      PA.integratedAlertsDailyAllHighest,
      PA.integratedAlertsDailySbtnNominal,
      PA.integratedAlertsDailySbtnHigh,
      PA.integratedAlertsDailySbtnHighest,
      PA.integratedAlertsDailyJrcNominal,
      PA.integratedAlertsDailyJrcHigh,
      PA.integratedAlertsDailyJrcHighest,
      PA.integratedAlertsAreaAllNominal,
      PA.integratedAlertsAreaAllHigh,
      PA.integratedAlertsAreaAllHighest,
      PA.integratedAlertsAreaSbtnNaturalForestsNominal,
      PA.integratedAlertsAreaSbtnNaturalForestsHigh,
      PA.integratedAlertsAreaSbtnNaturalForestsHighest,
      PA.integratedAlertsAreaSbtnNaturalEcosystemNominal,
      PA.integratedAlertsAreaSbtnNaturalEcosystemHigh,
      PA.integratedAlertsAreaSbtnNaturalEcosystemHighest,
      PA.integratedAlertsAreaJrcNominal,
      PA.integratedAlertsAreaJrcHigh,
      PA.integratedAlertsAreaJrcHighest,
      AA.[Country],
      AA.[State],
      AA.[Sub State],
      AD.total_ha as totalHa,
      AA.[Location Name] AS name_all,
      AA.[gadmid],
      AA.gadmid AS gadmid_2,
      AA.Latitude AS gadmid_2_lat, AA.Longitude AS gadmid_2_lon,
      S.gadmid AS gadmid_1, S.Latitude AS gadmid_1_lat, S.Longitude AS gadmid_1_lon,
      C.gadmid AS gadmid_0, C.Latitude AS gadmid_0_lat, C.Longitude AS gadmid_0_lon,
      L.location_lat, L.location_lon,
      L.location_name
    FROM dbo.[Analyses-Dashboard] AD
    
    LEFT JOIN ParsedAlerts PA ON PA.location_id = AD.location_id
    
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
      ) AS Combined
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
    LEFT JOIN (SELECT [Location Name] AS location_name, location_id, longitude AS location_lon, latitude AS location_lat FROM [{LIST_TABLE}]) L ON L.location_id = AD.location_id
    WHERE AD.list_id = {LIST_ID}
    ORDER BY AD.location_id
    OFFSET {PAGE_NUMBER}*{ROW_PER_PAGE} ROWS FETCH NEXT {ROW_PER_PAGE} ROWS ONLY
  '
    SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}', @listId)
    SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @list_table_name)
    SET @SQL = REPLACE(@SQL, '{PAGE_NUMBER}', @pageNumber)
    SET @SQL = REPLACE(@SQL, '{ROW_PER_PAGE}', @rowsPerPage)

    EXEC sp_executesql @SQL;
`;
