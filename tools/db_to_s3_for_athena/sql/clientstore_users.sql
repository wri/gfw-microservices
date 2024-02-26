
-- set up temporary table to be used
IF OBJECT_ID('tempdb..#user_data') IS NOT NULL
	DROP TABLE #user_data

-- create temporary table for storing user data from EACH organization
CREATE TABLE #user_data(
	id INT NOT NULL,
	email NVARCHAR(MAX) NOT NULL,
	job_id NVARCHAR(MAX) NOT NULL,
	organization NVARCHAR(MAX) NOT NULL,	
	org_type INT NOT NULL,
	access_level INT NOT NULL,
	date_activated DATETIME NULL,
	Africa INT NULL, Asia INT NULL, Australia INT NULL, Europe INT NULL, North_America INT NULL, South_America INT NULL,
	cattle INT NULL, cocoa INT NULL, coffee INT NULL, palm_oil INT NULL, pulp_and_paper INT NULL, rubber INT NULL, soy INT NULL, sugar_cane INT NULL
);

-- setting up variables
DECLARE @classification_id INT
DECLARE @org_id INT
DECLARE @org_name NVARCHAR(MAX)
DECLARE @db_name NVARCHAR(MAX)
DECLARE @sql NVARCHAR(MAX)

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
		PRINT 'COLLECTING USERS FROM ' + @org_name + '(' + CAST(@org_id AS VARCHAR(25)) + ') - ' + @db_name;

		BEGIN		
			DECLARE @param NVARCHAR(MAX);
			SET @param = '@classification_id_OUT INT OUTPUT';		
			SET @sql = N'SELECT TOP (1) @classification_id_OUT = classification_id FROM [{db_name}].[dbo].[AccountClassifications]';			
			SET @sql = REPLACE(@sql, '{db_name}', @db_name);
			--PRINT @sql;
		
			EXEC sp_executesql @sql, @param, @classification_id_OUT = @classification_id OUTPUT;
			--PRINT @classification_id;
			
			SET @sql = N' 
				INSERT INTO #user_data (
					id, email, job_id
					, organization	
					, org_type
					, access_level
					, date_activated
					, Africa, Asia, Australia, Europe, North_America, South_America
					, cattle, cocoa, coffee, palm_oil, pulp_and_paper, rubber, soy, sugar_cane
				)
				SELECT u2.id, u2.email, u2.title_id AS job_id
						, ''{org_name}'' AS organization
						, ' + CAST(@classification_id AS NVARCHAR(10)) + ' AS org_type
						, u2.access_level_id AS access_level
						, u2.activated_time AS date_activated
						, user_geos.Africa
						, user_geos.Asia
						, user_geos.Australia
						, user_geos.Europe
						, user_geos.[North America] AS North_America
						, user_geos.[South America]	AS South_America
						, user_comm.cattle
						, user_comm.cocoa
						, user_comm.coffee
						, user_comm.[palm oil] AS palm_oil
						, user_comm.[pulp and paper] AS pulp_and_paper
						, user_comm.rubber
						, user_comm.soy
						, user_comm.[sugar cane] AS sugar_cane
				FROM  [{db_name}].[dbo].[users] u2			
				LEFT JOIN (
					SELECT *
					FROM (
						SELECT u.id, u.email		
							, geo.geography_name
						FROM [{db_name}].[dbo].[users] u
						LEFT JOIN (
							SELECT ug.user_id, g.geography_name
							FROM [{db_name}].[dbo].[UserGeographies] ug
							LEFT JOIN gfwpro.dbo.Geographies g ON g.id = ug.geography_id
							WHERE ug.geography_id <> 0
						) geo ON geo.user_id = u.id
						WHERE u.is_system_user = 0 AND geo.geography_name <> ''NULL''
					) t

					PIVOT(
						COUNT(t.email)
						FOR t.geography_name IN (
							Africa, Asia, Australia, Europe, [North America], [South America]
						)
					) AS pivot_table
				) user_geos ON user_geos.id = u2.id
				LEFT JOIN (
					SELECT *
					FROM (
						SELECT u.id, u.email		
							, comm.commmodity_name
						FROM [{db_name}].[dbo].[users] u
						LEFT JOIN (
							SELECT uc.user_id, c.commmodity_name
							FROM [{db_name}].[dbo].[UserCommodities] uc
							LEFT JOIN gfwpro.dbo.Commodities c ON c.id = uc.commodity_id
						) comm ON comm.user_id = u.id
						WHERE u.is_system_user = 0 AND comm.commmodity_name IS NOT NULL
					) t

					PIVOT(
						COUNT(t.email)
						FOR t.commmodity_name IN (
							cattle, cocoa, coffee, [palm oil], [pulp and paper], rubber, soy, [sugar cane]
						)
					) AS pivot_table
				) user_comm ON user_comm.id = u2.id
				WHERE u2.email NOT LIKE ''%blueraster%''
					AND u2.email NOT LIKE ''%wri%''
				;'

			SET @sql = REPLACE(@sql, '{org_name}', REPLACE(TRIM(@org_name), '''', ''''''));
			SET @sql = REPLACE(@sql, '{db_name}', @db_name);
			--PRINT @sql;			
			EXEC sp_executesql @sql;
		
		END
	FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id;

END

CLOSE db_cursor
DEALLOCATE db_cursor

SELECT * FROM #user_data;
