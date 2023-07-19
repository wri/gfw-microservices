export const getOrganizationAnalysisUsage = `
DECLARE @MyCursor CURSOR;
DECLARE @DBName NVARCHAR(255);
DECLARE @id_status INT;
DECLARE @SQL NVARCHAR(max);
DECLARE @SQLQuery NVARCHAR(max);
DECLARE @PARAM NVARCHAR(255);
DECLARE @TABLE NVARCHAR(80);

BEGIN
    IF @listLevel = 1
        BEGIN
            create table #TotArea_list (total_area_analysis INT,  max_analyzed_location INT, total_list INT, organization_id INT, list_id INT);
        END
    ELSE
        BEGIN
            create table #TotArea_org (total_area_analysis INT,  max_analyzed_location INT, total_list INT, organization_id INT);
        END


    SET @MyCursor = CURSOR FOR
    SELECT org.organization_db FROM
    Organizations org JOIN
        Statuses st ON st.id = org.organization_status_id
    WHERE st.status_name = 'active' and (org.id = @organization or  ISNULL(@organization, '') = '');

    OPEN @MyCursor
    FETCH NEXT FROM @MyCursor
    INTO @DBName

    SET @SQL = 'INSERT INTO {TABLE} SELECT {PARAM} FROM [{DB_NAME}].[dbo].[ListsProcessing] lp WHERE analysis_end_time > ''{START_DATE}''  AND analysis_end_time < ''{END_DATE}'' ';
    SET @TABLE = '#TotArea_org'
    SET @PARAM = 'SUM(area_analyzed_list_ha) as total_area_analysis, MAX(area_analyzed_locations_ha) as max_analyzed_location, COUNT(Distinct list_id) as total_list, {organization} as organization_id';
    IF @listLevel = 1
        BEGIN
            SET @SQL = @SQL + ' GROUP BY list_id;'
            SET @PARAM =  @PARAM + ', list_id'
            SET @TABLE = '#TotArea_list'
        END
    ELSE

    PRINT @PARAM
    SET @SQL = REPLACE(@SQL, '{PARAM}', @PARAM)
    PRINT @SQL
    SET @SQL = REPLACE(@SQL, '{TABLE}', @TABLE)

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SELECT @id_status = id FROM [dbo].[Organizations] odb WHERE odb.organization_db = @DBName;

        SET @SQLQuery = REPLACE(@SQL, '{DB_NAME}', @DBName)
        SET @SQLQuery = REPLACE(@SQLQuery, '{START_DATE}', @startDate)
        SET @SQLQuery = REPLACE(@SQLQuery, '{END_DATE}', @endDate)
        SET @SQLQuery = REPLACE(@SQLQuery, '{organization}',  @id_status)
        PRINT @SQLQuery
        EXEC sp_executesql @SQLQuery

        FETCH NEXT FROM @MyCursor
        INTO @DBName
    END;

    CLOSE @MyCursor ;
    DEALLOCATE @MyCursor;

    SET @SQL = REPLACE('SELECT * FROM {TABLE}', '{TABLE}', @TABLE)
    EXEC sp_executesql @SQL;
    SET @SQL = REPLACE('DROP TABLE {TABLE}', '{TABLE}', @TABLE)
    EXEC sp_executesql @SQL;
END;
`

export interface OrganizationAnalysisUsage {
  total_area_analysis: number;
  max_analyzed_location: number;
  total_list: number;
  organization_id: number;
  list_id?: number;
}
