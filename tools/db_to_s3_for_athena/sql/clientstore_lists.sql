
-- SET up temporary table to be used
IF OBJECT_ID('tempdb..#list_data') IS NOT NULL
	DROP TABLE #list_data

-- create temporary table for storing data from EACH organization
CREATE TABLE #list_data(
	organization NVARCHAR(MAX),
	list_name NVARCHAR(MAX),
	country NVARCHAR(50),
	commodity NVARCHAR(100),	
	analysis_area FLOAT,
	locations_count INT,
	list_status NVARCHAR(25)
);


-- SETting up variables
DECLARE @org_id INT;
DECLARE @db_name NVARCHAR(MAX);
DECLARE @org_name NVARCHAR(MAX);
DECLARE @list_id INT;
DECLARE @lists_count INT;
DECLARE @list_status_id INT;
DECLARE @country NVARCHAR(25);
DECLARE @commodity NVARCHAR(25);
DECLARE @analysis_area_sum FLOAT;
DECLARE @locations_count INT;
DECLARE @sql NVARCHAR(MAX);
DECLARE @status_params NVARCHAR(MAX);

SET @status_params = '@list_status_id_query INT OUTPUT';

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
		PRINT CAST(@org_id AS VARCHAR(25)) + ': ' + @db_name;

		BEGIN		
			DECLARE @list_table_name NVARCHAR(MAX) = NULL;
			DECLARE @list_item INT = 1;
			
			IF OBJECT_ID('tempdb..#temp_list_names') IS NOT NULL
				DROP TABLE #temp_list_names
			
			--create table to hold list names for a single organization
			CREATE TABLE #temp_list_names(
				id2 INT IDENTITY(1,1),
				list_name NVARCHAR(MAX)
			);

			SET @sql = 'INSERT INTO #temp_list_names
						SELECT st.TABLE_NAME from [{DB_NAME}].INFORMATION_SCHEMA.TABLES st
						WHERE st.TABLE_NAME LIKE '+char(39)+ '%list-%'+char(39);
			
			SET @sql = REPLACE(@sql, '{DB_NAME}', @db_name)
			--PRINT (@sql);
			EXEC sp_executesql @sql;

			SELECT @lists_count = COUNT(list_name) FROM #temp_list_names
			
			IF @lists_count > 0
				--PRINT('LISTS COUNT - ' + CAST(@lists_count AS NVARCHAR(MAX)));			

				WHILE @list_item <= @lists_count -- loops for every list that the organization has 
					BEGIN
						SELECT @list_table_name = list_name
						FROM #temp_list_names
						WHERE id2 = (@list_item)

						-- dynamic sql to find list status
						SET @sql = N'SELECT @list_status_id_query = L.list_status_id
									FROM [{DB_NAME}].dbo.Lists L
									WHERE L.list_table_name = ''{LIST_TABLE_NAME}''';
						
						SET @sql = REPLACE(@sql, '{DB_NAME}', @db_name);
						SET @sql = REPLACE(@sql, '{LIST_TABLE_NAME}', @list_table_name);
						EXEC sp_executesql @sql, @status_params, @list_status_id_query = @list_status_id OUTPUT;						

						IF @list_table_name IS NOT NULL		
							IF OBJECT_ID('tempdb..#temp_grouped_list_info') IS NOT NULL
								DROP TABLE #temp_grouped_list_info

							CREATE TABLE #temp_grouped_list_info(
								id3 INT IDENTITY(1,1),
								country NVARCHAR(50),
								commodity NVARCHAR(100),
								analysis_area FLOAT,
								locations_count INT
							);
							-- dynamic sql to find total area and number of locations in the list
							SET @sql = N'INSERT INTO #temp_grouped_list_info
										SELECT Country, REPLACE(Commodity, '','', '';'') AS Commodity
											, SUM([Analysis Area])
											, COUNT(location_id)
										FROM [{DB_NAME}].dbo.[{LIST_TABLE_NAME}]
										GROUP BY Country, Commodity';
						
							SET @sql = REPLACE(@sql, '{DB_NAME}', @db_name);
							SET @sql = REPLACE(@sql, '{LIST_TABLE_NAME}', @list_table_name);
							SET @sql = REPLACE(@sql, '{LOCATION_STATUS}', @list_status_id);							
							--PRINT @sql;
							EXEC sp_executesql @sql;
											
							-- inserts the collected data into #list_data
							INSERT into #list_data (organization, list_name, country, commodity, analysis_area, locations_count, list_status )
							SELECT @org_name		
								, @list_table_name	
								, gli.country					
								, gli.commodity					
								, gli.analysis_area
								, gli.locations_count
								, CASE
									WHEN @list_status_id = 2 THEN 'SUCCEEDED'
									WHEN @list_status_id = 3 THEN 'FAILED'
									ELSE 'PENDING' END
							FROM #temp_grouped_list_info gli
							SET @list_item = @list_item + 1
					END;				
		
		END

		FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id;

END

CLOSE db_cursor
DEALLOCATE db_cursor

DROP TABLE #temp_grouped_list_info;
DROP TABLE #temp_list_names;

SELECT * FROM #list_data ORDER BY organization, list_name, country, commodity;
DROP TABLE #list_data;