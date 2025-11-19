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

CREATE TABLE #AllAnalyses
(
  organization_id INT,
  organization_name NVARCHAR(255),
  list_id INT,
  analysis_label NVARCHAR(50),
  analysis_start_datetime DATETIME,
  analysis_end_date DATE,
  is_api_list BIT -- API flag (list-level)
);

-- Cursor to iterate through all clientstores
DECLARE db_cursor CURSOR FOR
SELECT organization_db, organization_name, id
FROM gfwpro.dbo.Organizations
WHERE organization_db IS NOT NULL
  AND organization_db LIKE 'clientstore-%' -- only valid orgs
  AND organization_name NOT LIKE '%Blue Raster%'
  AND organization_name NOT LIKE '%World Resources Institute%'
  AND organization_name NOT LIKE '%WRI Engagement%'
  AND organization_name NOT LIKE '%WRI Consultant%'
  AND organization_name NOT LIKE '%Pro Product Team%'
  AND organization_name NOT LIKE '%GFW Pro LATAM Engagement%'

OPEN db_cursor;
FETCH NEXT FROM db_cursor INTO @orgDbName, @orgName, @orgId;

WHILE @@FETCH_STATUS = 0
BEGIN
  SET @sql = N'
    INSERT INTO #AllAnalyses
    SELECT
      ' + CAST(@orgId AS NVARCHAR(10)) + N' AS organization_id,
      N''' + REPLACE(@orgName, '''', '''''') + N''' AS organization_name,
      LP.list_id,
      CASE LP.analysis_type
        WHEN ''AFI'' THEN ''Post-2020''
        WHEN ''FCD'' THEN ''Post-2000''
        WHEN ''ALERTS'' THEN ''Alerts''
        WHEN ''GHG'' THEN ''GHG''
        ELSE ''Unknown''
      END AS analysis_label,
      LP.analysis_start_time AS analysis_start_datetime,
      CAST(LP.analysis_end_time AS DATE) AS analysis_end_date,
      CASE WHEN EU.id IS NOT NULL THEN 1 ELSE 0 END AS is_api_list
    FROM [' + @orgDbName + N'].dbo.ListsProcessing AS LP
    LEFT JOIN [' + @orgDbName + N'].dbo.LargeLists AS LL
      ON LL.list_id = LP.list_id
    LEFT JOIN [' + @orgDbName + N'].dbo.ExternalUploads AS EU
      ON LL.s3_filename = EU.uploadKeyFile
    -- Optional WHERE clause to filter active lists
    -- WHERE LP.list_status_id IS NULL OR LP.list_status_id <> 3
  ';

  BEGIN TRY
    PRINT 'Processing ' + @orgDbName;
    EXEC sp_executesql @sql;
  END TRY
  BEGIN CATCH
    PRINT 'Error processing ' + @orgDbName + ': ' + ERROR_MESSAGE();
  END CATCH

  FETCH NEXT FROM db_cursor INTO @orgDbName, @orgName, @orgId;
END;

CLOSE db_cursor;
DEALLOCATE db_cursor;

-- Final output
SELECT *
FROM #AllAnalyses;
