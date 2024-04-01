/**
 * Returns the dashboard data for a GFW List using pagination
 *
 * @listId INT - id of the list
 * @pageNumber INT - page that we want to get
 * @rowsPerPage INT - number of rows per page
 *
 * Returns type DashboardDataType (same as getDashboardData)
 */
export const getGFWListsDashboardDataPaginated = `
  -- SET NOCOUNT ON added to prevent extra result sets from
  -- interfering with SELECT statements.
  SET NOCOUNT ON;

  DECLARE @list_table_name NVARCHAR(150)

  SELECT @list_table_name = list_table_name FROM dbo.GFWLists WHERE id = @listId

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
    LEFT JOIN dbo.[list-administrativeAreas] AA ON AA.gadmid = AD.gadm_id
    LEFT JOIN (SELECT * FROM gfwpro.dbo.[list-administrativeAreas] WHERE [Sub State] IS NULL) S ON S.Country = AA.Country AND S.State = AA.State
    LEFT JOIN (SELECT * FROM gfwpro.dbo.[list-administrativeAreas] WHERE State IS NULL) C ON C.Country = AA.Country
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
