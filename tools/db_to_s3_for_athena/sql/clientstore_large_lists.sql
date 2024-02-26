-- SET up temporary table to be used
IF OBJECT_ID('tempdb..#large_list_data') IS NOT NULL
    DROP TABLE #large_list_data;

-- create temporary table for storing data from EACH organization
CREATE TABLE #large_list_data (
    organization NVARCHAR(MAX),
    large_list_id INT,
    list_id INT,
    list_name NVARCHAR(MAX),
    list_status NVARCHAR(25)
);

-- SETting up variables
DECLARE @org_id INT;
DECLARE @db_name NVARCHAR(MAX);
DECLARE @org_name NVARCHAR(MAX);
DECLARE @sql NVARCHAR(MAX);

DECLARE db_cursor CURSOR FOR
    SELECT Orgs.organization_db, Orgs.organization_name, Orgs.id
    FROM gfwpro.dbo.Organizations Orgs
    WHERE Orgs.organization_status_id = 2
        AND Orgs.organization_name NOT LIKE '%Blue Raster%'				
        AND Orgs.organization_name NOT LIKE '%World Resources Institute%'
        AND Orgs.organization_name NOT LIKE '%WRI Engagement%'					
    ORDER BY Orgs.organization_name;

OPEN db_cursor
FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id

WHILE @@FETCH_STATUS = 0
BEGIN
    IF DB_ID(@db_name) IS NOT NULL
        PRINT CAST(@org_id AS VARCHAR(25)) + ': ' + @db_name;

    BEGIN
        -- dynamic sql to get list information from LargeLists
        SET @sql = N'
            INSERT INTO #large_list_data (organization, large_list_id, list_id, list_name, list_status)
            SELECT
                N''' + REPLACE(@org_name, '''', '''''') + ''' AS organization,
                LL.large_list_id,
                LL.list_id,
                LL.list_name,
                LL.list_status
            FROM [' + @db_name + '].dbo.LargeLists LL';
        
        EXEC sp_executesql @sql;
    END

    FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id;
END

CLOSE db_cursor
DEALLOCATE db_cursor

-- Select the final data
SELECT * FROM #large_list_data;

-- Drop the temporary table
DROP TABLE #large_list_data;
