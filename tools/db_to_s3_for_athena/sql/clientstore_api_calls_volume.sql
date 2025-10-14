-- ==========================================
--  Collect literal API access logs across clientstores
--  (detect activity_description like 'The endpoint ... was accessed by user ...')
--  This references the string in /externalapi/src/list-analysis/utils/saveActivityLogEndpoint.ts
-- ==========================================

-- Drop temp table if exists
IF OBJECT_ID('tempdb..#ApiCalls') IS NOT NULL
    DROP TABLE #ApiCalls;

-- Create temp table for storing raw API call activity
CREATE TABLE #ApiCalls (
    organization_id INT NOT NULL,
    organization_name NVARCHAR(255) NOT NULL,
    org_database NVARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    activity_time DATETIME NOT NULL,
    activity_description NVARCHAR(MAX) NOT NULL
);

DECLARE @orgId INT;
DECLARE @orgName NVARCHAR(255);
DECLARE @dbName NVARCHAR(255);
DECLARE @sql NVARCHAR(MAX);

-- Cursor over all organizations
DECLARE db_cursor CURSOR FOR
SELECT organization_db, organization_name, id
FROM gfwpro.dbo.Organizations
WHERE organization_db IS NOT NULL
  AND organization_db LIKE 'clientstore-%'
  AND organization_name NOT LIKE '%Blue Raster%'				
  AND organization_name NOT LIKE '%World Resources Institute%'
  AND organization_name NOT LIKE '%WRI Engagement%';

OPEN db_cursor;
FETCH NEXT FROM db_cursor INTO @dbName, @orgName, @orgId;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF DB_ID(@dbName) IS NOT NULL
    BEGIN
        PRINT 'Collecting API activity logs from ' + @orgName + ' (' + CAST(@orgId AS VARCHAR(10)) + ') - ' + @dbName;

        SET @sql = N'
            INSERT INTO #ApiCalls (
                organization_id,
                organization_name,
                org_database,
                user_id,
                activity_time,
                activity_description
            )
            SELECT
                ' + CAST(@orgId AS NVARCHAR(10)) + N' AS organization_id,
                N''' + REPLACE(@orgName, '''', '''''') + N''' AS organization_name,
                N''' + REPLACE(@dbName, '''', '''''') + N''' AS org_database,
                AL.user_id,
                AL.activity_time,
                AL.activity_description
            FROM [' + @dbName + N'].dbo.ActivityLog AL
            WHERE AL.activity_description LIKE ''The endpoint % was accessed by user %''
        ';

        EXEC sp_executesql @sql;
    END

    FETCH NEXT FROM db_cursor INTO @dbName, @orgName, @orgId;
END

CLOSE db_cursor;
DEALLOCATE db_cursor;

-- Return the raw API activity logs
SELECT * FROM #ApiCalls;



