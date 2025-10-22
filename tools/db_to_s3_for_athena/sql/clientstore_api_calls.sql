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
    activity_type NVARCHAR(MAX) NOT NULL
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
                activity_type
            )
            SELECT
                ' + CAST(@orgId AS NVARCHAR(10)) + N' AS organization_id,
                N''' + REPLACE(@orgName, '''', '''''') + N''' AS organization_name,
                N''' + REPLACE(@dbName, '''', '''''') + N''' AS org_database,
                AL.user_id,
                AL.activity_time,
                CASE AL.activity_type_id
                    WHEN 1 THEN ''AccountRequested''
                    WHEN 2 THEN ''AccountActivated''
                    WHEN 3 THEN ''AccountDeactivated''
                    WHEN 4 THEN ''AccountUpdated''
                    WHEN 5 THEN ''UserCreated''
                    WHEN 6 THEN ''UserUpdated''
                    WHEN 7 THEN ''UserLogin''
                    WHEN 8 THEN ''UserLogout''
                    WHEN 9 THEN ''UserActivated''
                    WHEN 10 THEN ''UserForgotPassword''
                    WHEN 11 THEN ''UserResetPassword''
                    WHEN 12 THEN ''UserDeactivated''
                    WHEN 13 THEN ''LocationUploadedToList''
                    WHEN 14 THEN ''LocationDeletedFromList''
                    WHEN 15 THEN ''LocationCopiedToList''
                    WHEN 16 THEN ''LocationUpdatedInList''
                    WHEN 17 THEN ''LocationMovedFromList''
                    WHEN 18 THEN ''ListCreated''
                    WHEN 19 THEN ''ListUpdate''
                    WHEN 20 THEN ''ListUpdateNew''
                    WHEN 21 THEN ''ListDeleted''
                    WHEN 22 THEN ''ListAnalyzing''
                    WHEN 35 THEN ''ListShared''
                    WHEN 36 THEN ''ListUnShared''
                    WHEN 37 THEN ''ListUnSharedWithAll''
                    WHEN 28 THEN ''ConnectionRequested''
                    WHEN 29 THEN ''ConnectionAccepted''
                    WHEN 30 THEN ''ConnectionRejected''
                    WHEN 31 THEN ''ConnectionResent''
                    WHEN 32 THEN ''ConnectionCancelled''
                    WHEN 38 THEN ''ListGetPaginatedListInfo''
                    WHEN 39 THEN ''ListInfo''
                    WHEN 40 THEN ''ListPrepareUpload''
                    WHEN 41 THEN ''ListGenerate''
                    ELSE ''UnknownActivity''
                END AS activity_type
            FROM [' + @dbName + N'].dbo.ActivityLog AL
            WHERE AL.activity_description LIKE ''The endpoint % was accessed by user %'';
        ';

        EXEC sp_executesql @sql;
    END

    FETCH NEXT FROM db_cursor INTO @dbName, @orgName, @orgId;
END

CLOSE db_cursor;
DEALLOCATE db_cursor;

-- Return the raw API activity logs
SELECT * FROM #ApiCalls;