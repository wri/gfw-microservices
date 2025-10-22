-- ==========================================
-- Build dataset for Active Users per Organization (with API/UI flag)
-- Only uses measurable interactions
-- ==========================================

-- Temporary table to store combined user activity
IF OBJECT_ID('tempdb..#ActiveUsers') IS NOT NULL DROP TABLE #ActiveUsers;

CREATE TABLE #ActiveUsers (
    organization_id INT,
    organization_name NVARCHAR(255),
    is_api_org BIT,          -- API (1) or UI (0)
    user_id INT,
    last_activity DATETIME,
    commodity NVARCHAR(255)  -- NEW: to allow filtering in PowerBI
);

DECLARE @orgDbName NVARCHAR(255);
DECLARE @orgName NVARCHAR(255);
DECLARE @orgId INT;
DECLARE @sql NVARCHAR(MAX);

-- Cursor to iterate through all clientstores
DECLARE db_cursor CURSOR FOR
SELECT organization_db, organization_name, id
FROM gfwpro.dbo.Organizations
WHERE organization_db IS NOT NULL
  AND organization_db LIKE 'clientstore-%'
  AND organization_name NOT LIKE '%Blue Raster%'
  AND organization_name NOT LIKE '%World Resources Institute%'
  AND organization_name NOT LIKE '%WRI Engagement%';

OPEN db_cursor;
FETCH NEXT FROM db_cursor INTO @orgDbName, @orgName, @orgId;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = N'
        INSERT INTO #ActiveUsers (organization_id, organization_name, is_api_org, user_id, last_activity, commodity)
        SELECT
            ' + CAST(@orgId AS NVARCHAR(10)) + N' AS organization_id,
            N''' + REPLACE(@orgName, '''', '''''') + N''' AS organization_name,
            CASE WHEN EXISTS (
                SELECT 1 FROM gfwpro.dbo.ExternalAPIKeys E WHERE E.organizationId = ' + CAST(@orgId AS NVARCHAR(10)) + N'
            ) THEN 1 ELSE 0 END AS is_api_org,
            user_id,
            MAX(last_activity) AS last_activity,
            commodity
        FROM
        (
            -- Lists analyzed
            SELECT LP.user_id, LP.analysis_start_time AS last_activity, L.Commodity
            FROM [' + @orgDbName + N'].dbo.ListsProcessing LP
            INNER JOIN [' + @orgDbName + N'].dbo.Lists L
                ON LP.list_id = L.id
            WHERE LP.user_id IS NOT NULL

            UNION ALL

            -- Downloads or map/diagnostic views (ActivityLogs)
            SELECT AL.user_id, AL.activity_time AS last_activity, NULL AS commodity
            FROM [' + @orgDbName + N'].dbo.ActivityLog AL
            WHERE AL.user_id IS NOT NULL
              AND (
                  AL.activity_description LIKE ''%downloaded CSV%''
                  OR AL.activity_description LIKE ''%viewed map%''
                  OR AL.activity_description LIKE ''%viewed diagnostic%''
              )
        ) AS UserActivities
        GROUP BY 
            organization_id, 
            organization_name, 
            is_api_org, 
            user_id, 
            commodity;
    ';

    PRINT 'Processing ' + @orgDbName;
    EXEC sp_executesql @sql;

    FETCH NEXT FROM db_cursor INTO @orgDbName, @orgName, @orgId;
END;

CLOSE db_cursor;
DEALLOCATE db_cursor;

SELECT * FROM #ActiveUsers;
