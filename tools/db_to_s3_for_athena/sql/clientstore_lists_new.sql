
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
DECLARE @analysis_area_sum FLOAT;
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
			DECLARE @analysis_table_name NVARCHAR(MAX) = NULL;
			DECLARE @list_item INT = 1;
			
			IF OBJECT_ID('tempdb..#temp_list_names') IS NOT NULL
				DROP TABLE #temp_list_names
			
			--create table to hold list names for a single organization
			CREATE TABLE #temp_list_names(
				id2 INT IDENTITY(1,1),
				list_name NVARCHAR(MAX),
                analysis_name NVARCHAR(MAX),
				list_id INT
			);

			SET @sql = 'INSERT INTO #temp_list_names
						SELECT list_table_name,
                               list_analysis_table_name,
							   id
                        FROM [{DB_NAME}].dbo.Lists';
			
			SET @sql = REPLACE(@sql, '{DB_NAME}', @db_name)
			--PRINT (@sql);
			EXEC sp_executesql @sql;

			SELECT @lists_count = COUNT(list_name)
			FROM #temp_list_names
			
			IF @lists_count > 0
				WHILE @list_item <= @lists_count -- loops for every list that the organization has 
					BEGIN
						SELECT @list_table_name = list_name,
                               @analysis_table_name = analysis_name,
							   @list_id = list_id
						FROM #temp_list_names
						WHERE id2 = (@list_item)

						-- dynamic sql to find list status
						SET @sql = N'SELECT @list_status_id_query = L.list_status_id
									FROM [{DB_NAME}].dbo.Lists L
									WHERE L.list_table_name = ''{LIST_TABLE_NAME}''';
						
						SET @sql = REPLACE(@sql, '{DB_NAME}', @db_name);
						SET @sql = REPLACE(@sql, '{LIST_TABLE_NAME}', @list_table_name);
						EXEC sp_executesql @sql, @status_params, @list_status_id_query = @list_status_id OUTPUT;						

						BEGIN
							BEGIN TRY
								IF @list_table_name IS NOT NULL		
									IF OBJECT_ID('tempdb..#temp_grouped_list_info') IS NOT NULL
										DROP TABLE #temp_grouped_list_info

									CREATE TABLE #temp_grouped_list_info(
										list_id INT,
										country NVARCHAR(50),
										commodity NVARCHAR(100),
										analysis_area FLOAT,
										locations_count INT
									);
																
									-- Construct the dynamic SQL query string to check if the AFI table has values
									DECLARE @afi_has_vals INT
									SET @sql = 'SELECT @afi_has_vals = CASE WHEN EXISTS(SELECT 1 FROM [' + @db_name + '].[dbo].[AFIAnalysis] WHERE list_id = ' + CAST(@list_id AS NVARCHAR(50))  +') THEN 1 ELSE 0 END'
									EXEC sp_executesql @sql, N'@afi_has_vals INT OUTPUT', @afi_has_vals OUTPUT

									-- Construct the dynamic SQL query string to check if the analysis table exists
									SET @sql = QUOTENAME(@db_name) + '.dbo.' + QUOTENAME(@analysis_table_name);

									-- Determine query based on existance of table values
									IF OBJECT_ID(@sql, 'U') IS NOT NULL AND @afi_has_vals = 1
									BEGIN
										-- Analysis table exists
										-- AFI table has values
										SET @sql = N'INSERT INTO #temp_grouped_list_info
													SELECT
														{LIST_ID} AS list_id
														,lat.Country
														,lat.Commodity
														,SUM(ISNULL(afi.total_area_ha, 0)) AS analysis_area
														,COUNT(ISNULL(lat.location_id, 0)) AS loc_count
													FROM (
														SELECT
															{LIST_ID} AS list_id
															,at.location_id
															,lt.Country
															,lt.Commodity
														FROM [{DB_NAME}].dbo.[{LIST_TABLE_NAME}] AS lt
														LEFT JOIN [{DB_NAME}].dbo.[{ANALYSIS_TABLE_NAME}] AS at
														ON lt.location_id = at.location_id
													) AS lat
													LEFT JOIN (
														SELECT
															location_id
															,list_id
															,total_area_ha
														FROM [{DB_NAME}].dbo.[AFIAnalysis] 
													) AS afi
													ON lat.location_id = afi.location_id AND lat.list_id = afi.list_id
													GROUP BY Country, Commodity';
										SET @sql = REPLACE(@sql, '{ANALYSIS_TABLE_NAME}', @analysis_table_name);	
									END
									ELSE IF OBJECT_ID(@sql, 'U') IS NOT NULL AND @afi_has_vals = 0
									BEGIN
										-- Analysis table exists
										-- AFI Table has no values
										SET @sql = N'INSERT INTO #temp_grouped_list_info
													SELECT
														{LIST_ID} AS list_id
														,lt.Country
														,lt.Commodity
														,SUM(ISNULL(at.total_area, 0)) AS analysis_area
														,COUNT(ISNULL(lt.location_id, 0)) AS location_count
													FROM [{DB_NAME}].dbo.[{LIST_TABLE_NAME}] AS lt
													JOIN [{DB_NAME}].dbo.[{ANALYSIS_TABLE_NAME}] AS at
													ON lt.location_id = at.location_id
													GROUP BY lt.Country, lt.Commodity';
										SET @sql = REPLACE(@sql, '{ANALYSIS_TABLE_NAME}', @analysis_table_name);	
									END
									ELSE
									BEGIN
										-- Analysis table does not exist
										-- AFI Table has no values
										SET @sql = N'INSERT INTO #temp_grouped_list_info
												SELECT
													{LIST_ID} AS list_id
													,Country
													,Commodity
													,SUM(ISNULL([Analysis Area], 0))
													,COUNT(ISNULL(location_id, 0))
												FROM [{DB_NAME}].dbo.[{LIST_TABLE_NAME}]
												GROUP BY Country, Commodity';
									END

									SET @sql = REPLACE(@sql, '{DB_NAME}', @db_name);
									SET @sql = REPLACE(@sql, '{LIST_ID}', @list_id);
									SET @sql = REPLACE(@sql, '{LIST_TABLE_NAME}', @list_table_name);					
									--PRINT @sql;
									EXEC sp_executesql @sql;
								
								-- inserts the collected data into #list_data
								INSERT into #list_data (organization, list_name, country, commodity, analysis_area, locations_count, list_status)
								SELECT @org_name		
									, @list_table_name	
									, gli.country					
									, gli.commodity					
									, gli.analysis_area
									, gli.locations_count
									, CASE
										WHEN @list_status_id = 2 THEN 'SUCCEEDED'
										WHEN @list_status_id = 3 THEN 'FAILED'
										ELSE 'PENDING'
									END
								FROM #temp_grouped_list_info gli
							END TRY
							BEGIN CATCH
								PRINT 'Table does not exist: ' + @list_table_name
							END CATCH

							SET @list_item = @list_item + 1
						END
					END		
		END

		FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id;

END

CLOSE db_cursor
DEALLOCATE db_cursor

DROP TABLE #temp_grouped_list_info;
DROP TABLE #temp_list_names;

SELECT * FROM #list_data ORDER BY organization, list_name, country, commodity;
DROP TABLE #list_data;