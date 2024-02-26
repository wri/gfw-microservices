/**
 * Gets the organization usage for the total area analyzed from lists, the total area analyzed from locations, and the total number of locations analyzed for each year, aggregating and summarizing data from the [ListsProcessing] table based on the year difference between organization activated time and analysis_end_time
 *
 * Requires the following parameters:
 * @param {Int} orgId
 */
export const getOrganizationRolloverLimitsAmounts = `
DECLARE @orgActivatedTime DATETIME;
DECLARE @orgDBName NVARCHAR(max);
DECLARE @iterationYear INT;
DECLARE @maxYears INT;
DECLARE @iterationCursor CURSOR;
DECLARE @currentYear INT;
DECLARE @SQL NVARCHAR(max);

BEGIN

    DROP TABLE IF EXISTS #RolloverLimitsData;
    CREATE TABLE #RolloverLimitsData (
        years INT,
        availableAnalyzableArea BIGINT,
        availableLocations BIGINT
    );

    SELECT 
        @orgActivatedTime = OG.organization_activated_time 
        ,@orgDBName = OG.organization_db
    FROM [dbo].[Organizations] OG
    WHERE OG.id = @orgId;

    SET @iterationYear = 0;
    SET @maxYears = DATEDIFF(YEAR, @orgActivatedTime, GETDATE());
    
    SET @iterationCursor = CURSOR LOCAL FAST_FORWARD FOR
    SELECT YEAR(DATEADD(YEAR, @currentYear, @orgActivatedTime));

    --  

    OPEN @iterationCursor;
    FETCH NEXT FROM @iterationCursor 
    INTO @currentYear;

    SET @SQL = '
        INSERT INTO #RolloverLimitsData (years, availableAnalyzableArea, availableLocations)
        SELECT
            {CURRENT_YEAR} as years,
            SUM(CASE WHEN (LP.area_analyzed_list_ha - AL.MaxAreaAnalyzeablePerYear) > 0 THEN (LP.area_analyzed_list_ha - AL.MaxAreaAnalyzeablePerYear) ELSE 0 END) as availableAnalyzableArea,
            SUM(CASE WHEN (LP.locations_analyzed - AL.max_locations_per_year) > 0 THEN (LP.locations_analyzed - AL.max_locations_per_year) ELSE 0 END) as availableLocations
        FROM [{ORG_DB_NAME}].[dbo].[ListsProcessing] LP
        JOIN [{ORG_DB_NAME}].[dbo].[AnalysisLimits] AL ON YEAR(LP.analysis_end_time) = {CURRENT_YEAR}
        WHERE YEAR(LP.analysis_end_time) = {CURRENT_YEAR};
    ';
    
    WHILE @@FETCH_STATUS = 0 AND @iterationYear <= @maxYears
    BEGIN
        SET @SQL = REPLACE(@SQL, '{ORG_DB_NAME}', @orgDBName)
        SET @SQL = REPLACE(@SQL, '{CURRENT_YEAR}', @currentYear)
        
       	PRINT @SQL

        BEGIN TRY
            EXEC sp_executesql @SQL
        END TRY
        BEGIN CATCH
            PRINT 'Something went wrong calculating rollover limits data.';
        END CATCH


        SET @currentYear = @currentYear + 1;
        FETCH NEXT FROM @iterationCursor INTO @currentYear;
    END

    CLOSE @iterationCursor;
    DEALLOCATE @iterationCursor;
    
    -- select the sum of the results from the temporary table
    SELECT
        years,
        SUM(availableAnalyzableArea) as totalAvailableAnalyzableArea,
        SUM(availableLocations) as totalAvailableLocations
    FROM #RolloverLimitsData
    GROUP BY years;
    
    -- Drop the temporary table
    DROP TABLE #RolloverLimitsData;
    
END
`;

export interface OrganizationRolloverLimitsAmount {
  years: number;
  totalAreaAnalyzed: number;
  maxAreaAnalyzed: number;
  totalLocationsAnalyzed: number;
}
