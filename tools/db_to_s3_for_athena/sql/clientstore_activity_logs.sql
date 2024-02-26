
-- set up temporary table to be used
IF OBJECT_ID('tempdb..#activity_data') IS NOT NULL
	DROP TABLE #activity_data

-- create temporary table for storing user data from EACH organization
CREATE TABLE #activity_data (
	org_id INT NOT NULL,
	org_name NVARCHAR(MAX) NOT NULL,
	org_database NVARCHAR(MAX) NOT NULL,
	user_id INT NOT NULL,
	user_email NVARCHAR(MAX) NOT NULL,
	activity_description VARCHAR(MAX) NOT NULL,
	activity_time DATETIME NOT NULL,
	activity_type_id INT NOT NULL,
	activity_type VARCHAR(MAX) NOT NULL,
	activity_type_category VARCHAR(MAX) NOT NULL
);

DECLARE @org_id INT
DECLARE @org_name NVARCHAR(MAX)
DECLARE @db_name NVARCHAR(MAX)
DECLARE @sql NVARCHAR(MAX)
--DECLARE @activity_count INT

DECLARE db_cursor CURSOR FOR
	SELECT Orgs.organization_db, Orgs.organization_name, Orgs.id
	FROM gfwpro.dbo.Organizations Orgs
	WHERE Orgs.organization_status_id = 2
		-- ignore any internal organizations
		AND Orgs.organization_name NOT LIKE '%Blue Raster%'				
		AND Orgs.organization_name NOT LIKE '%World Resources Institute%'
		AND Orgs.organization_name NOT LIKE '%WRI Engagement%'		
	ORDER BY Orgs.organization_name;

OPEN db_cursor
FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id

WHILE @@FETCH_STATUS = 0
BEGIN
	IF DB_ID(@db_name) IS NOT NULL
	PRINT 'COLLECTING ACTIVITY LOGS FROM ' + @org_name + '(' + CAST(@org_id AS VARCHAR(25)) + ') - ' + @db_name;
	BEGIN				

		SET @sql = N' 			
			INSERT INTO #activity_data ( org_id
				, org_name
				, org_database
				, user_id, user_email
				, activity_description
				, activity_time, activity_type_id
				, activity_type, activity_type_category
			)			
			SELECT {org_id} AS org_id
				, ''{org_name}'' AS org_name
				, ''{db_name_text}'' AS org_database
				, AL.user_id, U.email 
				, AL.activity_description
				, AL.activity_time, AL.activity_type_id
				, AT.activity_type_name AS activity_type
				, ATC.activity_type_category_name AS activity_type_category
			FROM [{db_name}].dbo.ActivityLog AL
			LEFT JOIN [{db_name}].dbo.Users U ON U.id = AL.user_id
			LEFT JOIN gfwpro.dbo.ActivityType AT ON AT.id = AL.activity_type_id
			LEFT JOIN gfwpro.dbo.ActivityTypeCategory ATC ON ATC.id = AT.activity_type_category_id
			WHERE U.email IS NOT NULL;' -- Temp fix, losing data due to null
		
		SET @sql = REPLACE(@sql, '{org_id}', @org_id);
		SET @sql = REPLACE(@sql, '{org_name}', REPLACE(TRIM(@org_name), '''', ''''''));
		SET @sql = REPLACE(@sql, '{db_name_text}', REPLACE(@db_name, '''', ''''''));
		SET @sql = REPLACE(@sql, '{db_name}', @db_name);
		--PRINT @sql;
		EXEC sp_executesql @sql;
		
	END
	FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id;

END

CLOSE db_cursor
DEALLOCATE db_cursor

SELECT * FROM #activity_data;
