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
DECLARE @PARAM NVARCHAR(255);
DECLARE @TABLE NVARCHAR(80);

BEGIN
  create table #TotArea_org (
    total_area_analyzed BIGINT,  
    max_area_analyzed BIGINT, 
    number_of_lists_analyzed INT, 
    locations_analyzed INT,
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

  SET @SQL = 'INSERT INTO {TABLE} SELECT {PARAM} FROM [{DB_NAME}].[dbo].[ListsProcessing] lp WHERE analysis_end_time > ''{START_DATE}''  AND analysis_end_time < ''{END_DATE}'' AND lp.user_id IS NOT NULL ';
  SET @TABLE = '#TotArea_org'
  SET @PARAM = 'ISNULL(SUM(area_analyzed_locations_ha), 0) as total_area_analyzed, ISNULL(MAX(area_analyzed_locations_ha), 0) as max_area_analyzed, COUNT(Distinct list_id) as number_of_lists_analyzed, ISNULL(SUM(locations_analyzed), 0) as locations_analyzed, {organization} as organization_id';

  PRINT @PARAM
  SET @SQL = REPLACE(@SQL, '{PARAM}', @PARAM)
  PRINT @SQL
  SET @SQL = REPLACE(@SQL, '{TABLE}', @TABLE)

  WHILE @@FETCH_STATUS = 0
  BEGIN
    SELECT @id = id FROM [dbo].[Organizations] odb WHERE odb.organization_db = @DBName;

    SET @SQLQuery = REPLACE(@SQL, '{DB_NAME}', @DBName)
    SET @SQLQuery = REPLACE(@SQLQuery, '{START_DATE}', @startDate)
    SET @SQLQuery = REPLACE(@SQLQuery, '{END_DATE}', @endDate)
    SET @SQLQuery = REPLACE(@SQLQuery, '{organization}',  @id)
    PRINT @SQLQuery
    BEGIN TRY
      EXEC sp_executesql @SQLQuery
    END TRY
    BEGIN CATCH
      SET @errorQuery = 'INSERT INTO {TABLE} VALUES {VALUES}'
      SET @errorQuery = REPLACE(@errorQuery, '{VALUES}', '(0,0,0,{organization})')
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
  organization_id: number;
  organization_name: string;
  list_id?: number;
}
