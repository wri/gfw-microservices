-- ==========================================
--  Build combined dataset for Power BI
--  Lists by Analysis Type
-- ==========================================

DECLARE @orgDbName NVARCHAR(255);
DECLARE @orgName NVARCHAR(255);
DECLARE @orgId INT;
DECLARE @sql NVARCHAR(MAX);

-- Create temp table for combined results
IF OBJECT_ID('tempdb..#AllAnalyses') IS NOT NULL DROP TABLE #AllAnalyses;

CREATE TABLE #AllAnalyses (
    organization_id INT,
    organization_name NVARCHAR(255),
    list_id INT,
    analysis_status NVARCHAR(50),
    analysis_type NVARCHAR(50),
    analysis_label NVARCHAR(50),
    analysis_date_time DATETIME,
    is_api_list BIT  -- API flag
);

-- Cursor to iterate through all clientstores
DECLARE db_cursor CURSOR FOR
SELECT organization_db, organization_name, id
FROM gfwpro.dbo.Organizations
WHERE organization_db IS NOT NULL
  AND organization_db LIKE 'clientstore-%' -- only valid orgs
  AND organization_name NOT LIKE '%Blue Raster%'				
  AND organization_name NOT LIKE '%World Resources Institute%'
  AND organization_name NOT LIKE '%WRI Engagement%';

OPEN db_cursor;
FETCH NEXT FROM db_cursor INTO @orgDbName, @orgName, @orgId;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = N'
        INSERT INTO #AllAnalyses
        SELECT
            ' + CAST(@orgId AS NVARCHAR(10)) + N' AS organization_id,
            N''' + REPLACE(@orgName, '''', '''''') + N''' AS organization_name,
            L.id AS list_id,
            S.status_name AS analysis_status,
            LAS.AnalysisID AS analysis_type,
            CASE LAS.AnalysisID
                WHEN ''AFI'' THEN ''Post-2020''
                WHEN ''FCD'' THEN ''Post-2000''
                WHEN ''ALERTS'' THEN ''Alerts''
                WHEN ''GHG'' THEN ''GHG''
                ELSE ''Unknown''
            END AS analysis_label,
            LP.analysis_start_time AS analysis_date_time,
            CASE WHEN E.organizationId IS NOT NULL THEN 1 ELSE 0 END AS is_api_list
        FROM [' + @orgDbName + N'].dbo.Lists AS L
        LEFT JOIN [' + @orgDbName + N'].dbo.ListsAnalysisStatus AS LAS
            ON LAS.ListID = L.id
        LEFT JOIN [' + @orgDbName + N'].dbo.ListsProcessing AS LP
            ON LP.list_id = L.id
            AND LP.analysis_type = LAS.AnalysisID
        LEFT JOIN gfwpro.dbo.Statuses AS S
            ON S.id = LAS.Status
        LEFT JOIN gfwpro.dbo.ExternalAPIKeys AS E
            ON E.organizationId = ' + CAST(@orgId AS NVARCHAR(10)) + N'
        WHERE (L.list_status_id IS NULL OR L.list_status_id <> 3); -- exclude deleted lists
    ';

    PRINT 'Processing ' + @orgDbName;
    EXEC sp_executesql @sql;

    FETCH NEXT FROM db_cursor INTO @orgDbName, @orgName, @orgId;
END;

CLOSE db_cursor;
DEALLOCATE db_cursor;

-- Final output
SELECT * FROM #AllAnalyses;
