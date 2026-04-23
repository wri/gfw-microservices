/**
 * This SP is used to get the analysis usage for an organization or a list
 * The command requires the following parameters:
 * @organization INT,
 * @startDate DATETIME,
 * @endDate DATETIME
 */

export const getOrganizationAnalysisUsage = `
DECLARE @MyCursor CURSOR;
DECLARE @DBName NVARCHAR(255);
DECLARE @id INT;
DECLARE @SQL NVARCHAR(max);
DECLARE @SQLQuery NVARCHAR(max);
DECLARE @errorQuery NVARCHAR(max);
DECLARE @PARAM NVARCHAR(max);
DECLARE @TABLE NVARCHAR(80);

BEGIN
  SET NOCOUNT ON;
  create table #TotArea_org (
    total_area_analyzed BIGINT,
    max_area_analyzed BIGINT,
    number_of_lists_analyzed INT,
    locations_analyzed INT,
    total_tokens FLOAT,
    organization_id INT
  );

  SET @MyCursor = CURSOR FOR
  SELECT org.organization_db FROM
  Organizations org JOIN
    Statuses st ON st.id = org.organization_status_id
  WHERE st.status_name = 'active' and (org.id = @organization or  ISNULL(@organization, '') = '');

  OPEN @MyCursor
  FETCH NEXT FROM @MyCursor
  INTO @DBName

  SET @SQL = 'INSERT INTO {TABLE} SELECT {PARAM}
  FROM [{DB_NAME}].[dbo].[ListsProcessing] lp
  LEFT JOIN [gfwpro].[dbo].[ChargeRate] cr
  ON lp.analysis_type = cr.analysis_type AND cr.effective_date = (
    SELECT MAX(cr2.effective_date) FROM [gfwpro].[dbo].[ChargeRate] cr2 WHERE cr2.analysis_type = lp.analysis_type AND cr2.effective_date <= lp.analysis_end_time
  )
  WHERE analysis_end_time >= ''{START_DATE}''
    AND analysis_end_time <= ''{END_DATE}''
    AND (lp.analysis_type <> ''GHG'' OR lp.analysis_end_time >= ''2025-11-22'')
    AND (lp.analysis_type <> ''ALERTS-BATCH'' OR lp.analysis_end_time >= ''2026-04-18'') ';
  SET @TABLE = '#TotArea_org';
  SET @PARAM = 'ISNULL(SUM(CASE WHEN lp.analysis_type = ''GHG'' AND lp.analysis_end_time < ''2025-11-22'' THEN 0
              WHEN lp.analysis_type = ''ALERTS-BATCH'' AND lp.analysis_end_time < ''2026-04-18'' THEN 0
              ELSE lp.area_analyzed_locations_ha END), 0) as total_area_analyzed,
  ISNULL(MAX(CASE WHEN lp.analysis_type = ''GHG'' AND lp.analysis_end_time < ''2025-11-22'' THEN 0
              WHEN lp.analysis_type = ''ALERTS-BATCH'' AND lp.analysis_end_time < ''2026-04-18'' THEN 0
              ELSE lp.area_analyzed_locations_ha END), 0) as max_area_analyzed,
  COUNT(lp.list_id) as number_of_lists_analyzed,
  ISNULL(SUM(CASE WHEN lp.analysis_type = ''GHG''  AND lp.analysis_end_time < ''2025-11-22'' THEN 0
              WHEN lp.analysis_type = ''ALERTS-BATCH'' AND lp.analysis_end_time < ''2026-04-18'' THEN 0
              ELSE lp.locations_analyzed END), 0) as locations_analyzed,
  ISNULL(SUM((ISNULL(lp.locations_analyzed, 0) * ISNULL(cr.location_rate, 0)) + ISNULL(cr.list_rate, 0)), 0) as total_tokens,
  {organization} as organization_id';

  SET @SQL = REPLACE(@SQL, '{PARAM}', @PARAM)
  SET @SQL = REPLACE(@SQL, '{TABLE}', @TABLE)

  WHILE @@FETCH_STATUS = 0
  BEGIN
    SELECT @id = id FROM [dbo].[Organizations] odb WHERE odb.organization_db = @DBName;

    SET @SQLQuery = REPLACE(@SQL, '{DB_NAME}', @DBName)
    SET @SQLQuery = REPLACE(@SQLQuery, '{START_DATE}', @startDate)
    SET @SQLQuery = REPLACE(@SQLQuery, '{END_DATE}', @endDate)
    SET @SQLQuery = REPLACE(@SQLQuery, '{organization}',  @id)
    BEGIN TRY
      EXEC sp_executesql @SQLQuery
    END TRY
    BEGIN CATCH
      SET @errorQuery = 'INSERT INTO {TABLE} VALUES {VALUES}'
      SET @errorQuery = REPLACE(@errorQuery, '{VALUES}', '(0,0,0,0,0,{organization})')
      SET @errorQuery = REPLACE(@errorQuery, '{TABLE}', @TABLE)
      SET @errorQuery = REPLACE(@errorQuery, '{organization}',  @id)
      EXEC sp_executesql @errorQuery
    END CATCH
    FETCH NEXT FROM @MyCursor
    INTO @DBName
  END;

  CLOSE @MyCursor ;
  DEALLOCATE @MyCursor;

  SET @SQL = REPLACE('SELECT a.*, o.organization_name FROM {TABLE} a JOIN [dbo].[Organizations] o ON o.id = a.organization_id ', '{TABLE}', @TABLE)
  EXEC sp_executesql @SQL;
  SET @SQL = REPLACE('DROP TABLE {TABLE}', '{TABLE}', @TABLE)
  EXEC sp_executesql @SQL;
END;
`;

export interface OrganizationAnalysisUsage {
  total_area_analyzed: number;
  max_area_analyzed: number;
  number_of_lists_analyzed: number;
  locations_analyzed: number | null;
  total_tokens: number;
  organization_id: number;
  organization_name: string;
  list_id?: number;
}
