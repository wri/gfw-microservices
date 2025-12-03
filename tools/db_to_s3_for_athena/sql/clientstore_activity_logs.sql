-- Set up temporary table to be used
IF OBJECT_ID('tempdb..#activity_data') IS NOT NULL
  DROP TABLE #activity_data

-- Create temporary table for storing user data from EACH organization
CREATE TABLE #activity_data (
  org_id INT NOT NULL,
  org_name NVARCHAR(MAX) NOT NULL,
  org_database NVARCHAR(MAX) NOT NULL,
  user_id INT NOT NULL,
  user_email NVARCHAR(MAX) NOT NULL,
  activity_description VARCHAR(MAX) NOT NULL,
  activity_time NVARCHAR(50) NOT NULL,
  activity_type_id INT NOT NULL,
  activity_type VARCHAR(MAX) NOT NULL,
  activity_type_category VARCHAR(MAX) NOT NULL
);

DECLARE @org_id INT
DECLARE @org_name NVARCHAR(MAX)
DECLARE @db_name NVARCHAR(MAX)
DECLARE @sql NVARCHAR(MAX)
DECLARE @error_message NVARCHAR(MAX)

DECLARE db_cursor CURSOR FOR
  SELECT Orgs.organization_db, Orgs.organization_name, Orgs.id
  FROM gfwpro.dbo.Organizations Orgs
  WHERE Orgs.organization_status_id = 2
    -- Ignore any internal organizations
    AND Orgs.organization_name NOT LIKE '%Blue Raster%'
    AND Orgs.organization_name NOT LIKE '%World Resources Institute%'
    AND Orgs.organization_name NOT LIKE '%WRI Engagement%'
    AND Orgs.organization_name NOT LIKE '%WRI Consultant%'
    AND Orgs.organization_name NOT LIKE '%Pro Product Team%'
    AND Orgs.organization_name NOT LIKE '%GFW Pro LATAM Engagement%'
  ORDER BY Orgs.organization_name;

OPEN db_cursor
FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id

WHILE @@FETCH_STATUS = 0
BEGIN
  IF DB_ID(@db_name) IS NOT NULL
  BEGIN
    PRINT 'COLLECTING ACTIVITY LOGS FROM ' + @org_name + '(' + CAST(@org_id AS VARCHAR(25)) + ') - ' + @db_name;

    SET @sql = N'
      INSERT INTO #activity_data (
        org_id, org_name, org_database, user_id, user_email,
        activity_description, activity_time, activity_type_id,
        activity_type, activity_type_category
      )
      SELECT
        @org_id AS org_id,
        @org_name AS org_name,
        @db_name AS org_database,
        AL.user_id,
        U.email,
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(AL.activity_description, CHAR(9), '' ''),
              CHAR(10), '' ''
            ),
            CHAR(13), '' ''
          ),
          CHAR(160), '' ''
        ) AS activity_description,
        -- ISO 8601 format with milliseconds (YYYY-MM-DDTHH:MM:SS.mmm)
        CONVERT(VARCHAR, AL.activity_time, 126) AS analysis_datetime,
        AL.activity_type_id,
        ISNULL(AT.activity_type_name, ''Unknown'') AS activity_type,
        ISNULL(ATC.activity_type_category_name, ''Unknown'') AS activity_type_category
      FROM [' + @db_name + '].dbo.ActivityLog AL
      LEFT JOIN [' + @db_name + '].dbo.Users U ON U.id = AL.user_id
      LEFT JOIN gfwpro.dbo.ActivityType AT ON AT.id = AL.activity_type_id
      LEFT JOIN gfwpro.dbo.ActivityTypeCategory ATC ON ATC.id = AT.activity_type_category_id
      WHERE U.email IS NOT NULL;' -- Temp fix, losing data due to null

    BEGIN TRY
      EXEC sp_executesql @sql,
        N'@org_id INT, @org_name NVARCHAR(MAX), @db_name NVARCHAR(MAX)',
        @org_id, @org_name, @db_name;
    END TRY
    BEGIN CATCH
      SET @error_message = 'Error processing ' + @org_name + ': ' + ERROR_MESSAGE();
      PRINT @error_message;
    END CATCH
  END
  ELSE
  BEGIN
    PRINT 'Database does not exist: ' + @db_name;
  END

  FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id;
END

CLOSE db_cursor
DEALLOCATE db_cursor

-- Output the collected data
SELECT * FROM #activity_data ORDER BY org_name, activity_time DESC;

-- Clean up
DROP TABLE #activity_data;