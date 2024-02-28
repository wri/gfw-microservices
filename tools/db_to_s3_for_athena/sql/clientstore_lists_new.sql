-- Drop previous temp table if it exists
IF OBJECT_ID('tempdb..#list_data') IS NOT NULL
    DROP TABLE #list_data;

-- Create temporary table for storing data from EACH organization
CREATE TABLE #list_data (
    list_id INT
    organization NVARCHAR(MAX),
    list_name NVARCHAR(MAX),
    country NVARCHAR(MAX),
    commodity NVARCHAR(MAX),
    locations_count INT,
    list_area FLOAT,
    fcd_area FLOAT,
    afi_area FLOAT,
    list_status NVARCHAR(MAX)
);

-- Declare vars
DECLARE @org_id INT;
DECLARE @db_name NVARCHAR(MAX);
DECLARE @org_name NVARCHAR(MAX);
DECLARE @table_name NVARCHAR(MAX);
DECLARE @sql NVARCHAR(MAX);

-- Cursor to iterate over databases
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
        -- Cursor to iterate over lists
        DECLARE list_cursor CURSOR FOR
        SELECT list_name
        FROM [' + @db_name + '].[dbo].[Lists];

        OPEN list_cursor;

        FETCH NEXT FROM list_cursor INTO @ListName;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                -- dynamic sql to get list information from LargeLists
                SET @sql = N'
                    INSERT INTO #list_data (list_id, organization, list_name, country, commodity, locations_count, list_area, fcd_area, afi_area, list_status)
                    SELECT 
                        lists.id AS list_id,
                        {ORG_NAME} AS organization,
                        lists.list_name AS list_name,
                        ls.Country AS country,
                        ls.Commodity AS commodity,
                        COUNT(ls.location_id) AS locations_count,
                        SUM(ls.[Analysis Area]) AS list_area,
                        SUM(analysis.total_area) AS fcd_area,
                        SUM(afi.total_area_ha) AS afi_area,
                    CASE
                        WHEN lists.list_status_id = 2 THEN ''SUCCEEDED''
                        WHEN lists.list_status_id = 3 THEN ''FAILED''
                        ELSE ''PENDING'' END
                        AS list_status
                    FROM 
                        [{DB_NAME}].[dbo].[Lists] lists
                    JOIN 
                        [{DB_NAME}].[dbo].[AFIAnalysis] afi ON lists.id = afi.list_id
                    JOIN 
                        [{DB_NAME}].[dbo].[analysis-{TABLE_NAME}] analysis ON afi.location_id = analysis.location_id
                    JOIN 
                        [{DB_NAME}].[dbo].[list-{TABLE_NAME}] ls ON afi.location_id = ls.location_id
                    GROUP BY 
                        lists.id, lists.list_name, ls.Country, ls.Commodity, lists.list_status_id
                    ORDER BY 
                        lists.id ASC';

                SET @sql = REPLACE(@sql, '{DB_NAME}', @db_name)
                SET @sql = REPLACE(@sql, '{ORG_NAME}', @org_name)
                SET @sql = REPLACE(@sql, '{TABLE_NAME}', @db_name)
                PRINT(@sql)

                EXEC sp_executesql @sql;
                
            FETCH NEXT FROM list_cursor INTO @ListName;
        END

        CLOSE list_cursor;
        DEALLOCATE list_cursor;
    END

    FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id;
END

CLOSE db_cursor
DEALLOCATE db_cursor

-- Select the final data
SELECT * FROM #list_data;

-- Drop the temporary table
DROP TABLE #list_data;

