ALTER TABLE [dbo].[Lists] ADD associated_gfwlist TINYINT

GO

CREATE OR ALTER PROCEDURE [dbo].[uspImportFromDynamoDB]
	@json NVARCHAR(MAX),
	@analysis_table NVARCHAR(150)
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)

	-- Removing new lines
	SET @json = REPLACE(REPLACE(@json, CHAR(13), ''), CHAR(10), '');
	SET QUOTED_IDENTIFIER OFF

	DROP TABLE IF EXISTS [temp_analysis_table];
	DROP TABLE IF EXISTS [temp_merged_analysis_table];

	SELECT
		[location_id] AS [location_id],
		ISNULL([tree_cover_loss_total_yearly], '{}') AS [tree_cover_loss_total_yearly],
		ISNULL([tree_cover_loss_primary_forest_yearly], '{}') AS [tree_cover_loss_primary_forest_yearly],
		ISNULL([tree_cover_loss_peat_yearly], '{}') AS [tree_cover_loss_peat_yearly],
		ISNULL([tree_cover_loss_intact_forest_yearly], '{}') AS [tree_cover_loss_intact_forest_yearly],
		ISNULL([tree_cover_loss_protected_areas_yearly], '{}') AS [tree_cover_loss_protected_areas_yearly],
		ISNULL([tree_cover_loss_sea_landcover_yearly], '{}') AS [tree_cover_loss_sea_landcover_yearly],
		ISNULL([tree_cover_loss_idn_landcover_yearly], '{}') AS [tree_cover_loss_idn_landcover_yearly],
		ISNULL([tree_cover_loss_idn_primary_forest_yearly], '{}') AS [tree_cover_loss_idn_primary_forest_yearly],
		ISNULL([tree_cover_loss_soy_yearly], '{}') [tree_cover_loss_soy_yearly],
		ISNULL([tree_cover_loss_idn_legal_yearly], '{}') AS [tree_cover_loss_idn_legal_yearly],
		ISNULL([tree_cover_loss_idn_forest_moratorium_yearly], '{}') AS [tree_cover_loss_idn_forest_moratorium_yearly],
		ISNULL([tree_cover_loss_prodes_yearly], '{}') AS [tree_cover_loss_prodes_yearly],
		ISNULL([tree_cover_loss_prodes_wdpa_yearly], '{}') AS [tree_cover_loss_prodes_wdpa_yearly],
		ISNULL([tree_cover_loss_prodes_primary_forest_yearly], '{}') AS [tree_cover_loss_prodes_primary_forest_yearly],
		ISNULL([tree_cover_loss_brazil_biomes_yearly], '{}') AS [tree_cover_loss_brazil_biomes_yearly],
		ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_total] AS FLOAT)), 0.000000) AS [tree_cover_extent_total],
		ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_primary_forest] AS FLOAT)), 0.000000) AS [tree_cover_extent_primary_forest],
		ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_protected_areas] AS FLOAT)), 0.000000) AS [tree_cover_extent_protected_areas],
		ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_peat] AS FLOAT)), 0.000000) AS [tree_cover_extent_peat],
		ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_intact_forest] AS FLOAT)), 0.000000) AS [tree_cover_extent_intact_forest],
		ISNULL(CONVERT(decimal(18,6), CAST([natural_habitat_primary] AS FLOAT)), 0.000000) AS [natural_habitat_primary],
		ISNULL(CONVERT(decimal(18,6), CAST([natural_habitat_intact_forest] AS FLOAT)), 0.000000) AS [natural_habitat_intact_forest],
		ISNULL([natural_habitat_global_land_cover], '{}') AS [natural_habitat_global_land_cover],
		ISNULL(CONVERT(decimal(18,6), CAST([total_area] AS FLOAT)), 0.000000) AS [total_area],
		ISNULL(CONVERT(decimal(18,6), CAST([protected_areas_area] AS FLOAT)), 0.000000) AS [protected_areas_area],
		ISNULL(CONVERT(decimal(18,6), CAST([critical_habitat_alliance_zero] AS FLOAT)), 0.000000) AS [critical_habitat_alliance_zero],
		ISNULL(CONVERT(decimal(18,6), CAST([indigenous_people_land_rights] AS FLOAT)), 0.000000) AS [indigenous_people_land_rights],
		ISNULL(CONVERT(decimal(18,6), CAST([peat_area] AS FLOAT)), 0.000000) AS [peat_area],
		ISNULL([fires_counts_monthly], '{}') AS [fires_counts_monthly],
		ISNULL([soy_total_area], '{}') AS [soy_total_area],
		ISNULL(CONVERT(decimal(18,6), CAST([soy_pre2001_nonforest_area] AS FLOAT)), 0.000000) AS [soy_pre2001_nonforest_area],
		ISNULL([brazil_biomes], '{}') AS [brazil_biomes],
		ISNULL([idn_legal_area], '{}') AS [idn_legal_area],
		ISNULL([sea_landcover_area], '{}') AS [sea_landcover_area],
		ISNULL([idn_landcover_area], '{}') AS [idn_landcover_area],
		ISNULL(CONVERT(decimal(18,6), CAST([idn_forest_moratorium_area] AS FLOAT)), 0.000000) AS [idn_forest_moratorium_area],
		ISNULL([south_america_presence], 'false') AS [south_america_presence],
		ISNULL([legal_amazon_presence], 'false') AS [legal_amazon_presence],
		ISNULL([brazil_biomes_presence], 'false') AS [brazil_biomes_presence],
		ISNULL([cerrado_biome_presence], 'false') AS [cerrado_biome_presence],
		ISNULL([southeast_asia_presence], 'false') AS [southeast_asia_presence],
		ISNULL([indonesia_presence], 'false') AS [indonesia_presence],
		ISNULL([commodity_threat_deforestation_level], '{}') AS [commodity_threat_deforestation_level],
		ISNULL([commodity_threat_peat_level], '{}') AS [commodity_threat_peat_level],
		ISNULL([commodity_threat_protected_areas_level], '{}') AS [commodity_threat_protected_areas_level],
		ISNULL([commodity_threat_fires_level], '{}') AS [commodity_threat_fires_level],
		ISNULL([commodity_threat_overall_level], '{}') AS [commodity_threat_overall_level],
		ISNULL([commodity_threat_overall_score], '{}') AS [commodity_threat_overall_score],
		ISNULL([commodity_value_forest_extent_level], '{}') AS [commodity_value_forest_extent_level],
		ISNULL([commodity_value_peat_level], '{}') AS [commodity_value_peat_level],
		ISNULL([commodity_value_protected_areas_level], '{}') AS [commodity_value_protected_areas_level],
		ISNULL([commodity_value_overall_level], '{}') AS [commodity_value_overall_level],
		ISNULL([commodity_value_overall_score], '{}') AS [commodity_value_overall_score],
		ISNULL([commodity_value_forest_extent], '{}') AS [commodity_value_forest_extent],
		ISNULL([commodity_value_peat], '{}') AS [commodity_value_peat],
		ISNULL([commodity_value_protected_areas], '{}') AS [commodity_value_protected_areas],
		ISNULL([commodity_mill_priority_level], '{}') AS [commodity_mill_priority_level],
		ISNULL([commodity_mill_priority_score], '{}') AS [commodity_mill_priority_score],
		ISNULL([commodity_threat_deforestation], '{}') AS [commodity_threat_deforestation],
		ISNULL([commodity_threat_peat], '{}') AS [commodity_threat_peat],
		ISNULL([commodity_threat_protected_areas], '{}') AS [commodity_threat_protected_areas],
		ISNULL([commodity_threat_fires], '{}') AS [commodity_threat_fires],
		ISNULL([dissolved_data_location_info], '{}') AS [dissolved_data_location_info]
	INTO dbo.[temp_analysis_table]
	FROM OPENJSON (@json)
	WITH(
		[location_id] [int],
		[tree_cover_loss_total_yearly] [nvarchar](max),
		[tree_cover_loss_primary_forest_yearly] [nvarchar](max),
		[tree_cover_loss_peat_yearly] [nvarchar](max),
		[tree_cover_loss_intact_forest_yearly] [nvarchar](max),
		[tree_cover_loss_protected_areas_yearly] [nvarchar](max),
		[tree_cover_loss_sea_landcover_yearly] [nvarchar](max),
		[tree_cover_loss_idn_landcover_yearly] [nvarchar](max),
		[tree_cover_loss_idn_primary_forest_yearly] [nvarchar](max),
		[tree_cover_loss_soy_yearly] [nvarchar](2000),
		[tree_cover_loss_idn_legal_yearly] [nvarchar](max),
		[tree_cover_loss_idn_forest_moratorium_yearly] [nvarchar](max),
		[tree_cover_loss_prodes_yearly] [nvarchar](max),
		[tree_cover_loss_prodes_wdpa_yearly] [nvarchar](max),
		[tree_cover_loss_prodes_primary_forest_yearly] [nvarchar](max),
		[tree_cover_loss_brazil_biomes_yearly] [nvarchar](max),
		[tree_cover_extent_total] [nvarchar](max),
		[tree_cover_extent_primary_forest] [nvarchar](max),
		[tree_cover_extent_protected_areas] [nvarchar](max),
		[tree_cover_extent_peat] [nvarchar](max),
		[tree_cover_extent_intact_forest] [nvarchar](max),
		[natural_habitat_primary] [nvarchar](max),
		[natural_habitat_intact_forest] [nvarchar](max),
		[natural_habitat_global_land_cover] [nvarchar](max),
		[total_area] [nvarchar](max),
		[protected_areas_area] [nvarchar](max),
		[critical_habitat_alliance_zero] [nvarchar](max),
		[indigenous_people_land_rights] [nvarchar](max),
		[peat_area] [nvarchar](max),
		[fires_counts_monthly] [nvarchar](max),
		[soy_total_area] [nvarchar](max),
		[soy_pre2001_nonforest_area] [nvarchar](max),
		[brazil_biomes] [nvarchar](max),
		[idn_legal_area] [nvarchar](max),
		[sea_landcover_area] [nvarchar](max),
		[idn_landcover_area] [nvarchar](max),
		[idn_forest_moratorium_area] [nvarchar](max),
		[south_america_presence] [nvarchar](50),
		[legal_amazon_presence] [nvarchar](50),
		[brazil_biomes_presence] [nvarchar](50),
		[cerrado_biome_presence] [nvarchar](50),
		[southeast_asia_presence] [nvarchar](50),
		[indonesia_presence] [nvarchar](50),
		[commodity_threat_deforestation_level] [nvarchar](max),
		[commodity_threat_peat_level] [nvarchar](max),
		[commodity_threat_protected_areas_level] [nvarchar](max),
		[commodity_threat_fires_level] [nvarchar](max),
		[commodity_threat_overall_level] [nvarchar](max),
		[commodity_threat_overall_score] [nvarchar](max),
		[commodity_value_forest_extent_level] [nvarchar](max),
		[commodity_value_peat_level] [nvarchar](max),
		[commodity_value_protected_areas_level] [nvarchar](max),
		[commodity_value_overall_level] [nvarchar](max),
		[commodity_value_overall_score] [nvarchar](max),
		[commodity_value_forest_extent] [nvarchar](max),
		[commodity_value_peat] [nvarchar](max),
		[commodity_value_protected_areas] [nvarchar](max),
		[commodity_mill_priority_level] [nvarchar](max),
		[commodity_mill_priority_score] [nvarchar](max),
		[commodity_threat_deforestation] [nvarchar](max),
		[commodity_threat_peat] [nvarchar](max),
		[commodity_threat_protected_areas] [nvarchar](max),
		[commodity_threat_fires] [nvarchar](max),
		[dissolved_data_location_info] [nvarchar](300)
	)
	
	-- Create a temp table and join both the dynamodb data with the analysis table, making sure to include the location_status_id
	-- Cleaning up and converting the JSON analysis data into the analysis table
	SET @TEMPLATE = '
		SELECT
			L.[location_id],
			L.[location_status_id],
			D.[tree_cover_loss_total_yearly],
			D.[tree_cover_loss_primary_forest_yearly],
			D.[tree_cover_loss_peat_yearly],
			D.[tree_cover_loss_intact_forest_yearly],
			D.[tree_cover_loss_protected_areas_yearly],
			D.[tree_cover_loss_sea_landcover_yearly],
			D.[tree_cover_loss_idn_landcover_yearly],
			D.[tree_cover_loss_idn_primary_forest_yearly],
			D.[tree_cover_loss_soy_yearly],
			D.[tree_cover_loss_idn_legal_yearly],
			D.[tree_cover_loss_idn_forest_moratorium_yearly],
			D.[tree_cover_loss_prodes_yearly],
			D.[tree_cover_loss_prodes_wdpa_yearly],
			D.[tree_cover_loss_prodes_primary_forest_yearly],
			D.[tree_cover_loss_brazil_biomes_yearly],
			D.[tree_cover_extent_total],
			D.[tree_cover_extent_primary_forest],
			D.[tree_cover_extent_protected_areas],
			D.[tree_cover_extent_peat],
			D.[tree_cover_extent_intact_forest],
			D.[natural_habitat_primary],
			D.[natural_habitat_intact_forest],
			D.[natural_habitat_global_land_cover],
			D.[total_area],
			D.[protected_areas_area],
			D.[critical_habitat_alliance_zero],
			D.[indigenous_people_land_rights],
			D.[peat_area],
			D.[fires_counts_monthly],
			D.[soy_total_area],
			D.[soy_pre2001_nonforest_area],
			D.[brazil_biomes],
			D.[idn_legal_area],
			D.[sea_landcover_area],
			D.[idn_landcover_area],
			D.[idn_forest_moratorium_area],
			D.[south_america_presence],
			D.[legal_amazon_presence],
			D.[brazil_biomes_presence],
			D.[cerrado_biome_presence],
			D.[southeast_asia_presence],
			D.[indonesia_presence],
			D.[commodity_threat_deforestation_level],
			D.[commodity_threat_peat_level],
			D.[commodity_threat_protected_areas_level],
			D.[commodity_threat_fires_level],
			D.[commodity_threat_overall_level],
			D.[commodity_threat_overall_score],
			D.[commodity_value_forest_extent_level],
			D.[commodity_value_peat_level],
			D.[commodity_value_protected_areas_level],
			D.[commodity_value_overall_level],
			D.[commodity_value_overall_score],
			D.[commodity_value_forest_extent],
			D.[commodity_value_peat],
			D.[commodity_value_protected_areas],
			D.[commodity_mill_priority_level],
			D.[commodity_mill_priority_score],
			D.[commodity_threat_deforestation],
			D.[commodity_threat_peat],
			D.[commodity_threat_protected_areas],
			D.[commodity_threat_fires],
			D.[dissolved_data_location_info]
		INTO dbo.[temp_merged_analysis_table]
		FROM [temp_analysis_table] AS D 
		RIGHT JOIN [{ANALYSIS_TABLE}] AS L ON D.location_id = L.location_id ORDER BY L.location_id ASC;
		
		TRUNCATE TABLE [{ANALYSIS_TABLE}];

		-- Insert back into the analysis table
		INSERT INTO [{ANALYSIS_TABLE}]
		SELECT * FROM [temp_merged_analysis_table];

		DROP TABLE [temp_analysis_table];

		SELECT COUNT(*) AS analysesCount FROM [{ANALYSIS_TABLE}];
	'

	SET @SQL = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE}', @analysis_table)
	EXEC sp_executesql @SQL

GO

-- STORE PROCEDURES BELOW ARE FOR RE-RUNNING LISTS

CREATE OR ALTER PROCEDURE uspInsertNewLocationToAnalysisTable
	@list_id INT
AS
	DECLARE @analyisTableName NVARCHAR(150)
	DECLARE @listTableName NVARCHAR(150)

	SET @analyisTableName = (
		SELECT list_analysis_table_name
		FROM Lists
		WHERE id = @list_id
	)
	SET @listTableName = (
		SELECT list_table_name
		FROM Lists
		WHERE id = @list_id
	)

	-- Insert New Rows into Analysis Table.
	DECLARE @TEMPLATE NVARCHAR(1000)
	DECLARE @SQL NVARCHAR(1000)
	SET @TEMPLATE = '
		INSERT INTO [{ANALYSIS_TABLE}](location_id, location_status_id)
			SELECT location_id, 1
			FROM [{LIST_TABLE}]
			WHERE location_id > 0
	'
	SET @SQL = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE}', @analyisTableName)
	SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @listTableName)
	EXEC sp_executesql @SQL

GO

CREATE OR ALTER PROCEDURE dbo.uspRerunList
	@list_id INT,
  @list_analysis_table_name NVARCHAR(150),
	@associated_gfwlist TINYINT
AS
	DECLARE @status_id INT

	-- Set the status_id to 'processing'
	SET @status_id = 1

	-- Update the status_id to processing for that list_id
	EXEC uspResetListStatus @list_id, @status_id, @associated_gfwlist

	-- Drop the analyses list table
	EXEC uspDropOrganizationTable @list_analysis_table_name

	-- Create the list analysis table
	EXEC uspCreateAnalysisTable @list_analysis_table_name

	-- Insert new rows (equal to the number of locations) in the list analysis table
	EXEC uspInsertNewLocationToAnalysisTable @list_id
GO

CREATE OR ALTER PROCEDURE uspInsertNewLocationToAnalysisTable
				@list_id INT
			AS
				DECLARE @analyisTableName NVARCHAR(150)
				DECLARE @listTableName NVARCHAR(150)
				SET @analyisTableName = (
					SELECT list_analysis_table_name
					FROM Lists
					WHERE id = @list_id
				)
				SET @listTableName = (
					SELECT list_table_name
					FROM Lists
					WHERE id = @list_id
				)
				-- Insert New Rows into Analysis Table.
				DECLARE @TEMPLATE NVARCHAR(1000)
				DECLARE @SQL NVARCHAR(1000)
				SET @TEMPLATE = '
					INSERT INTO [{ANALYSIS_TABLE}](location_id, location_status_id)
						SELECT location_id, 1
						FROM [{LIST_TABLE}]
						WHERE location_id > 0
				'
				SET @SQL = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE}', @analyisTableName)
				SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @listTableName)
				EXEC sp_executesql @SQL
GO

DECLARE @db sysname
DECLARE @sql NVARCHAR(MAX)
DECLARE @TEMPLATE NVARCHAR(MAX)

SET @TEMPLATE = N'
DROP TABLE {DATABASE}.[dbo].[InternalShareRoutes]
CREATE TABLE {DATABASE}.[dbo].[InternalShareRoutes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[admin_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
	[list_id] [int] NOT NULL,
	[datetime] [datetime] NOT NULL,
 CONSTRAINT [PK_InternalShareRoutes] PRIMARY KEY CLUSTERED ([id] ASC)
 WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
 ON [PRIMARY]
) ON [PRIMARY]
'

-- Loop over all organizations
DECLARE db CURSOR FOR
SELECT name
FROM sys.databases d
WHERE
  (d.database_id > 4) AND /* No system databases */
  (d.state = 0) AND /* Online only */
  (d.is_distributor = 0) AND /* Not a distribution database */
  (d.is_read_only = 0) AND 
	(d.name <> 'gfwpro') AND
	(d.name <> 'logs-gfwpro')
OPEN db
FETCH NEXT FROM db INTO @db

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = REPLACE(@TEMPLATE, '{DATABASE}', QUOTENAME(@db))
    EXEC (@sql)
	FETCH NEXT FROM db INTO @db
END

CLOSE db
DEALLOCATE db

GO

CREATE OR ALTER PROCEDURE dbo.uspShareInternalList
	@admin_id INT,
	@user_id INT,
	@list_id INT,
	@datetime DATETIME
AS
	INSERT INTO InternalShareRoutes(admin_id, user_id, list_id, datetime) VALUES (@admin_id, @user_id, @list_id, @datetime);
GO

CREATE OR ALTER PROCEDURE dbo.uspActivateShareInternalList
	@admin_id INT,
	@user_id INT,
	@list_id INT,
	@datetime DATETIME
AS
	UPDATE InternalShareRoutes
	SET datetime = @datetime
	WHERE
		admin_id = @admin_id AND
		user_id = @user_id AND
		list_id = @list_id						
GO

CREATE OR ALTER PROCEDURE dbo.uspDeactivateShareInternalList
	@user_id INT,
	@list_id INT
AS
	DELETE FROM InternalShareRoutes
	WHERE
		user_id = @user_id AND
		list_id = @list_id
GO

CREATE OR ALTER PROCEDURE dbo.uspGetUserInternalShareLists
	@user_id INT
AS
	SELECT * FROM InternalShareRoutes
	WHERE
		admin_id = @user_id or
		user_id = @user_id
GO

CREATE OR ALTER PROCEDURE dbo.uspGetUserPendingInternalShareLists
	@user_id INT
AS
	SELECT * FROM InternalShareRoutes
	WHERE
		user_id = @user_id
GO

CREATE OR ALTER PROCEDURE dbo.uspAdminInternalLists
AS
	SELECT * FROM InternalShareRoutes
GO

CREATE OR ALTER PROCEDURE dbo.uspGetUsersInternalShareLists
	@list_id INT
AS
	SELECT * FROM InternalShareRoutes
	WHERE list_id = @list_id
GO

CREATE OR ALTER PROCEDURE dbo.uspDeactivateAllShareInternalList
	@user_id NVARCHAR(MAX),
	@list_id INT
AS
	DELETE FROM InternalShareRoutes
	WHERE
		list_id = @list_id AND
		user_id IN (SELECT value FROM STRING_SPLIT(@user_id, ','))

GO

/************************************************************
* New list column
************************************************************/

CREATE OR ALTER PROCEDURE [dbo].[uspCreateList]
	@user_id INT,
	@template_id INT,
	@list_name NVARCHAR(150),
	@list_table_name NVARCHAR(150),
	@list_analysis_table_name NVARCHAR(150),
	@list_status_id INT,
	@location_classification NVARCHAR(150),
	@custom_attribute_names NVARCHAR(150),
	@custom_attribute_types NVARCHAR(150),
	@associated_gfwlist TINYINT
AS
	-- Insert List into Lists Table
	INSERT INTO Lists(
		user_id, template_id, list_name, list_table_name, list_analysis_table_name, list_status_id,
		location_classification, custom_attribute_names, custom_attribute_types, associated_gfwlist
	) VALUES (
		@user_id, @template_id, @list_name, @list_table_name, @list_analysis_table_name, @list_status_id,
		@location_classification, @custom_attribute_names, @custom_attribute_types, @associated_gfwlist
	)
	-- Return ID of list entry
	SELECT SCOPE_IDENTITY() as list_id

GO

CREATE OR ALTER PROCEDURE [dbo].[uspResetListStatus]
	@list_id INT,
	@status_id INT,
	@associated_gfwlist TINYINT
AS
	UPDATE Lists SET list_status_id = @status_id, associated_gfwlist = @associated_gfwlist WHERE id = @list_id
	UPDATE Analyses SET status_id = @status_id, analysis_success_count = 0, analysis_fail_count = 0 WHERE list_id = @list_id

GO


ALTER PROCEDURE uspUpdateListStatus
	@list_table NVARCHAR(150),
	@analysis_table NVARCHAR(150),
	@dry_run BIT
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)

	SET @TEMPLATE = '
		DECLARE @list_id INT
		DECLARE @listStatus INT
		DECLARE @pendingLocations INT
		DECLARE @listAnalysisStatus INT
		-- Set List Status to still processing (Default)
		SET @listStatus = 1
		-- Obtain the list id from the list table name.
		SELECT @list_id = id FROM Lists WHERE list_table_name = ''{LIST_TABLE}''
		-- Determine the number of locations still processing.
		SELECT @pendingLocations = COUNT(*) FROM [{ANALYSIS_TABLE}] WHERE location_status_id = 1
		-- Determine the status of the list level analysis.
		SELECT @listAnalysisStatus = status_id FROM Analyses WHERE list_id = @list_id
		-- If there are no pending locations and list level analysis is complete,
		-- set list Status to Available and return Available status.
		IF (@pendingLocations = 0 AND @listAnalysisStatus = 2)
			BEGIN
				IF ({DRY_RUN} = 0)
					BEGIN
						BEGIN TRANSACTION
							UPDATE Lists WITH (ROWLOCK) SET list_status_id = 2 WHERE id = @list_id
						COMMIT TRANSACTION
					END
				SET @listStatus = 2
			END
		-- If List Level Analysis failed, set list status to failed.
		ELSE IF (@pendingLocations = 0 AND @listAnalysisStatus = 3)
			BEGIN
				IF ({DRY_RUN} = 0)
					BEGIN
						BEGIN TRANSACTION
							UPDATE Lists WITH (ROWLOCK) SET list_status_id = 3 WHERE id = @list_id
						COMMIT TRANSACTION
					END
				SET @listStatus = 3
			END
		SELECT @listStatus AS ListStatus
		'
		SET @SQL = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE}', @analysis_table)
		SET @SQL = REPLACE(@SQL, '{DRY_RUN}', @dry_run)
		SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @list_table)
		EXEC sp_executesql @SQL

GO



-- NEW June 8th 2019

CREATE PROCEDURE [dbo].[uspGetSimplifiedListLocations]
	@listID INT
AS
--DECLARE IMPORTANT VARIABLES
DECLARE @listLocationTableName NVARCHAR(1000)
DECLARE @listLocationTableCols NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)

-- Obtain the location table name and the analysis table name for the list.
SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @listID

-- Obtain the needed columns from the List Location Table. (All but Geometry)
SELECT @listLocationTableCols = STUFF(
	(
		SELECT '], L.[' + [name] FROM sys.columns
		WHERE
			[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
			AND [name] NOT IN ('Geometry')
			FOR XML PATH('')
	),1,3,'') + ']';

-- Return data from both tables
SET @SQL = 'SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS}, L.Geometry.Reduce(0.008).ToString() as [WKTGeometry] FROM [{LOCATION_TABLE}] L';
SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID);
SET @SQL = REPLACE(@SQL, '{LOCATION_COLUMNS}', @listLocationTableCols);
SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);
EXEC sp_executesql @SQL

GO