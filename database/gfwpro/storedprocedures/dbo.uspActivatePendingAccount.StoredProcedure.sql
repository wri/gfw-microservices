USE [gfwpro]
GO
/****** Object:  StoredProcedure [dbo].[uspActivatePendingAccount]    Script Date: 5/9/2024 1:09:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[uspActivatePendingAccount]
	@PendingAccountID INT,
	@UserSecret VARCHAR(50),
	@ActivatedTime SMALLDATETIME
AS
	--Declare Error Handler Variables.
	DECLARE @ErrorMessage   varchar(2000) ,@ErrorSeverity  tinyint ,@ErrorState     tinyint

	-- Obtain Organization Name.
	DECLARE @OrgName NVARCHAR(200)
	DECLARE @OrgdbName NVARCHAR(128)

	BEGIN TRY
		-- Get Organization Name
		SELECT @OrgName = organization_name FROM PendingAccounts WHERE id = @PendingAccountID

		-- Set Database Name.
		SET @OrgdbName = REPLACE(@OrgName, ' ', '')
		SET @OrgdbName = CONCAT('clientstore-', @OrgdbName)
		SET @OrgdbName = SUBSTRING(@OrgdbName, 1, 128)

		-- Obtain Pending Accounts Manager Id and Email.
		DECLARE @pendingAccountManagerID INT
		DECLARE @pendingAccountManagerEmail NVARCHAR(50)
		DECLARE @pendingAccountManagerFirstName NVARCHAR(35)
		DECLARE @pendingAccountManagerLastName NVARCHAR(35)
		SELECT @pendingAccountManagerID = id, @pendingAccountManagerEmail = email, @pendingAccountManagerFirstName = first_name, @pendingAccountManagerLastName = last_name
		FROM PendingAccountsUsers WHERE pendingaccounts_id = @PendingAccountID

		--Create Database for the Account.
		DECLARE @TEMPLATE NVARCHAR(MAX)
		DECLARE @SQL NVARCHAR(MAX)
		SET @TEMPLATE = 'CREATE DATABASE [{DATABASENAME}]; ALTER DATABASE [{DATABASENAME}] SET RECOVERY SIMPLE;'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		/********************************************************
		* CREATE ALL THE TABLES.
		********************************************************/
		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[ListsUploadStatus]
		(
			[list_id] INT PRIMARY KEY,
			[last_successful_stage] NVARCHAR(128),
			[error_info] NVARCHAR(512),
			[update_time] DATETIME,
			[worker_instance_id] NVARCHAR(128),
		 )'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[AccountProfile]
		(
			[id] INT IDENTITY(1,1) NOT NULL,
			[organization_name] NVARCHAR(200) NOT NULL,
			[organization_address] NVARCHAR(200) NOT NULL,
			[organization_website] NVARCHAR(200) NOT NULL,
			[organization_is_subsidiary] BIT NOT NULL,
			[organization_parent] NVARCHAR(200) NOT NULL,
			[manager_user_id] INT NOT NULL,
			CONSTRAINT [PK_AccountProfile] PRIMARY KEY CLUSTERED(id)
		 )'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[AccountClassifications]
		(
			[id] INT IDENTITY(1,1) NOT NULL,
			[classification_id] INT NOT NULL,
			CONSTRAINT [PK_AccountClassifications] PRIMARY KEY CLUSTERED(id)
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[InternalShareRoutes]
		(
			[id] [int] IDENTITY(1,1) NOT NULL,
			[admin_id] [int] NOT NULL,
			[user_id] [int] NOT NULL,
			[list_id] [int] NOT NULL,
			[datetime] [datetime] NOT NULL,
			CONSTRAINT [PK_InternalShareRoutes] PRIMARY KEY CLUSTERED (id)
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[SharingStatuses]
		(
			[id] INT IDENTITY(1,1) NOT NULL,
			[sharing_status] NVARCHAR(50) NOT NULL,
			CONSTRAINT [PK_SharingStatuses] PRIMARY KEY CLUSTERED(id)
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[Users]
		(
			[id] INT IDENTITY(1,1) NOT NULL,
			[first_name] NVARCHAR(35) NOT NULL,
			[middle_initial] NVARCHAR(2) NOT NULL,
			[last_name] NVARCHAR(35) NOT NULL,
			[email] NVARCHAR(50) NOT NULL,
			[phone] VARCHAR(50) NOT NULL,
			[title_id] INT NOT NULL,
			[other_title] NVARCHAR(150),
			[access_level_id] INT NOT NULL,
			[status_id] INT NOT NULL,
			[activated_time] SMALLDATETIME,
			[email_subscription] BIT NOT NULL,
			[is_system_user] BIT NOT NULL,
			[initial_login] SMALLDATETIME,
			[viirs_email_frequency] INT,
			[glad_email_frequency] INT,
			[forma_email_frequency] INT,
			[terrai_email_frequency] INT,
			[gran_chaco_email_frequency] INT,
			CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED(id),
			CONSTRAINT [UQ_UserEmail] UNIQUE(email),
			INDEX [Users_01] NONCLUSTERED(id)
		 )'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[UserCommodities]
		(
			[id] INT IDENTITY(1,1) NOT NULL,
			[user_id] INT NOT NULL,
			[commodity_id] INT NOT NULL,
			CONSTRAINT [PK_UserCommodities] PRIMARY KEY CLUSTERED(id),
			INDEX [UserCommodities_01] NONCLUSTERED(user_id)
		 )'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[UserGeographies]
		(
			[id] INT IDENTITY(1,1) NOT NULL,
			[user_id] INT NOT NULL,
			[geography_id] INT NOT NULL,
			CONSTRAINT [PK_UserGeographies] PRIMARY KEY CLUSTERED(id),
			INDEX [UserGeographies_01] NONCLUSTERED(user_id)
		 )'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[ActivityLog]
		(
			[id] INT IDENTITY(1,1) NOT NULL,
			[user_id] INT NOT NULL,
			[activity_type_id] INT NOT NULL,
			[activity_description] NVARCHAR(MAX) NOT NULL,
			[activity_time] DATETIME NOT NULL,
			CONSTRAINT [PK_ActivityLog] PRIMARY KEY CLUSTERED(id)
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[Lists]
		(
			[id] INT IDENTITY(1,1) NOT NULL,
			[user_id] INT NOT NULL,
			[template_id] INT NOT NULL,
			[list_name] NVARCHAR(150) NOT NULL,
			[list_table_name] NVARCHAR(150) NOT NULL,
			[list_analysis_table_name] NVARCHAR(150) NOT NULL,
			[list_status_id] INT NOT NULL,
			[list_error_message] NVARCHAR(2000),
			[location_classification] NVARCHAR(150),
			[custom_attribute_names] NVARCHAR(2000),
			[custom_attribute_types] NVARCHAR(2000),
			[list_locations_count] INT,
			[lock_status] SMALLDATETIME DEFAULT NULL,
			[lock_user_id] INT,
			[associated_gfwlist] TINYINT,
			[dashboard_last_submit] datetime2 NULL,
			[dashboard_last_results] datetime2 NULL,
			[vector_tiles_storage_path] NVARCHAR(300) NULL,
			[error_file_storage_path] NVARCHAR(300) NULL,
			[vector_tiles_last_updated] DATETIME2 NULL

			INDEX [IX_Lists_1] NONCLUSTERED(list_name, list_table_name, list_analysis_table_name),
			INDEX [IX_Lists_2] NONCLUSTERED(list_table_name),
			CONSTRAINT [PK_Lists] PRIMARY KEY CLUSTERED(id)
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL
		
		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[LargeLists]
		(
			[large_list_id] INT IDENTITY(1,1) NOT NULL,
			[list_id] [int] NOT NULL,
			[organization_user_id] [int] NOT NULL,
			[list_name] [nvarchar] (150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
			[s3_filename] [nvarchar] (150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
			[s3_location] [nvarchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
			[list_status] [nvarchar] (20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
			[creation_date] [datetime] NOT NULL,
			[modification_date] [datetime] NULL

			CONSTRAINT [PK_LargeLists] PRIMARY KEY CLUSTERED(large_list_id)
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		-- Dashboard Analysis Table for all lists
		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[Analyses-Dashboard]
		(
			[id] INT IDENTITY(1,1) NOT NULL,
			[list_id] INT NOT NULL,
			[location_id] INT NULL,
			[gadm_id] NVARCHAR(25) NULL,

			[glad_alerts_coverage] NVARCHAR(MAX) NULL,
			[glad_alerts_daily] NVARCHAR(MAX) NULL,
			[glad_alerts_weekly] NVARCHAR(MAX) NULL,
			[glad_alerts_monthly] NVARCHAR(MAX) NULL,
			[viirs_alerts_daily] NVARCHAR(MAX) NULL,
			[tree_cover_extent_total] decimal(18, 6) NULL

			INDEX [IX_AnalysesDashboard_1] NONCLUSTERED(list_id),
			INDEX [IX_AnalysesDashboard_2] NONCLUSTERED(location_id),
			INDEX [IX_AnalysesDashboard_3] NONCLUSTERED(gadm_id)
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		-- Analysis Table for each list
		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[Analyses]
		(
			[id] INT IDENTITY(1,1) NOT NULL,
			[list_id] INT NOT NULL,
			[status_id] INT NOT NULL DEFAULT 1,
			[analysis_success_count] INT NOT NULL DEFAULT 0,
			[analysis_fail_count] INT NOT NULL DEFAULT 0,

			[tree_cover_loss_total_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_peat_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_intact_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_protected_areas_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_sea_landcover_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_idn_landcover_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_idn_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_soy_yearly] NVARCHAR(2000) DEFAULT ''{}'',
			[tree_cover_loss_idn_legal_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_idn_forest_moratorium_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_prodes_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_prodes_wdpa_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_prodes_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_brazil_biomes_yearly] NVARCHAR(MAX) DEFAULT ''{}'',

			[tree_cover_extent_total] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_primary_forest] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_protected_areas] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_peat] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_intact_forest] DECIMAL(18, 6) DEFAULT 0.00000,

			[natural_habitat_primary] DECIMAL(18, 6) DEFAULT 0.00000,
			[natural_habitat_intact_forest] DECIMAL(18,6) DEFAULT 0.000000,
			[natural_habitat_global_land_cover] NVARCHAR(MAX) DEFAULT ''{}'',

			[total_area] DECIMAL(18, 6) DEFAULT 0.00000,
			[protected_areas_area] DECIMAL(18,6) DEFAULT 0.000000,
			[critical_habitat_alliance_zero] DECIMAL(18,6) DEFAULT 0.000000,
			[indigenous_people_land_rights] DECIMAL(18,6) DEFAULT 0.000000,
			[peat_area] DECIMAL(18,6) DEFAULT 0.000000,
			[fires_counts_monthly] NVARCHAR(MAX) DEFAULT ''{}'',
			[soy_total_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[soy_pre2001_nonforest_area] DECIMAL(18, 6)  DEFAULT 0.00000,
			[brazil_biomes] NVARCHAR(MAX) DEFAULT ''{}'',
			[idn_legal_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[sea_landcover_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[idn_landcover_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[idn_forest_moratorium_area] DECIMAL(18, 6) DEFAULT 0.00000,

			[south_america_presence] NVARCHAR(50) DEFAULT ''false'',
			[legal_amazon_presence] NVARCHAR(50) DEFAULT ''false'',
			[brazil_biomes_presence] NVARCHAR(50) DEFAULT ''false'',
			[cerrado_biome_presence] NVARCHAR(50) DEFAULT ''false'',
			[southeast_asia_presence] NVARCHAR(50) DEFAULT ''false'',
			[indonesia_presence] NVARCHAR(50) DEFAULT ''false'',

			[commodity_threat_deforestation_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_peat_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_protected_areas_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_fires_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_overall_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_overall_score] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_forest_extent_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_peat_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_protected_areas_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_overall_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_overall_score] NVARCHAR(MAX) DEFAULT ''{}'',

			[commodity_value_forest_extent] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_peat] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_protected_areas] NVARCHAR(MAX) DEFAULT ''{}'',

			[commodity_mill_priority_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_mill_priority_score] NVARCHAR(MAX) DEFAULT ''{}'',

			[commodity_threat_deforestation] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_peat] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_protected_areas] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_fires] NVARCHAR(MAX) DEFAULT ''{}'',
			[dissolved_geom_object_key] NVARCHAR(300) DEFAULT ''{}'',
            [tree_cover_loss_arg_otbn_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[arg_otbn_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[argentina_presence] NVARCHAR(50) DEFAULT ''false'',

			[protected_areas_by_category_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[landmark_by_category_area] NVARCHAR(MAX) DEFAULT ''{}'',

			[country_specific_deforestation_yearly] NVARCHAR(MAX),
			[country_specific_deforestation_wdpa_yearly] NVARCHAR(MAX),
			[country_specific_deforestation_landmark_yearly] NVARCHAR(MAX),
			[country_specific_deforestation_classified_region_yearly] NVARCHAR(MAX),
			[tree_cover_loss_by_country_yearly] NVARCHAR(MAX),
			[tree_cover_loss_by_country_wdpa_yearly] NVARCHAR(MAX),
			[tree_cover_loss_by_country_landmark_yearly] NVARCHAR(MAX),

			INDEX [IX_Analyses_1] NONCLUSTERED(list_id)
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[Policies]
		(
			[id] INT IDENTITY(1,1) NOT NULL,
			[document_name] NVARCHAR(250) NOT NULL
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[ListsAnalysisStatus](
			[ListID] [INT] NOT NULL,
			[AnalysisID] VARCHAR(30) NOT NULL,
			[Status] [INT] NOT NULL,
			[ErrorInfo] VARCHAR(2000) NULL,
			[UpdateTime] [DATETIME2] NULL,
			[s3_url] NVARCHAR(MAX) NULL,
			[expiration_time] [DATETIME2] NULL,
			[bundle_creation_time] [DATETIME2] NULL
			CONSTRAINT UQ_ListAnalyses_ListID_AnalysisID UNIQUE (ListID, AnalysisID)
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[ListsProcessing](
			[list_id] [INT] NOT NULL,
			[user_id] [INT] NULL,
			[analysis_type] [NVARCHAR](50) NOT NULL,
			[run_identifier] [NVARCHAR](300) NOT NULL,
			[analysis_start_time] [DATETIME2](7) NULL,
			[analysis_end_time] [DATETIME2](7) NULL,
			[area_analyzed_list_ha] [FLOAT] NULL,
			[area_analyzed_locations_ha] [FLOAT] NULL,
			[locations_analyzed] [INT] NULL
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL
		
		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[AFIAnalysis](
			[list_id] [SMALLINT] NULL,
			[location_id] [INT] NULL,
			[gadm_id] [NVARCHAR](50) NULL,
			[natural_land_area] [FLOAT] NULL,
			[natural_land_deforested_area] [FLOAT] NULL,
			[total_area_ha] [FLOAT] NULL,
			[status_code] [SMALLINT] NULL,
			[location_error] [NVARCHAR](MAX) NULL,
			[negligible_risk] [FLOAT] NULL,
			[jrc_land_area] [FLOAT] NULL DEFAULT 0,
			[jrc_land_deforested_area] [FLOAT] NULL DEFAULT 0,
			[jrc_forest_loss_by_year] [NVARCHAR](MAX) NULL DEFAULT ''{}'',
			[natural_forest_loss_by_year] [NVARCHAR](MAX) NULL DEFAULT ''{}''
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[ExternalUploads](
			[id] INT IDENTITY(1,1) NOT NULL,
			[userId] [INT] NULL,
			[uploadKeyFile] [NVARCHAR](200) NULL,
			[uploadUrl] [NVARCHAR](MAX) NULL,
			[uploadDateTime] [DATETIME] NULL
		)'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		/********************************************************
		* CREATE ALL THE TABLE TYPES.
		********************************************************/
		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''		
				CREATE TYPE dbo.[TT-Analyses-Dashboard]
				AS TABLE
				(
					[list_id] [int] NOT NULL,
					[location_id] [int] NULL,
					[gadm_id] [nvarchar] (25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
					[glad_alerts_coverage] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
					[glad_alerts_daily] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
					[glad_alerts_weekly] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
					[glad_alerts_monthly] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
					[viirs_alerts_daily] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
					[tree_cover_extent_total] [decimal] (18, 6) NULL
				)
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL


		/********************************************************
		* CREATE ALL THE STORED PROCEDURES.
		********************************************************/

		SET @TEMPLATE = 'USE [{DATABASENAME}] EXEC(''
			CREATE PROCEDURE uspInsertNewLocationToAnalysisTable
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
				SET @TEMPLATE = ''''
					INSERT INTO [{ANALYSIS_TABLE}](location_id, location_status_id)
						SELECT location_id, 1
						FROM [{LIST_TABLE}]
						WHERE location_id > 0
				''''
				SET @SQL = REPLACE(@TEMPLATE, ''''{ANALYSIS_TABLE}'''', @analyisTableName)
				SET @SQL = REPLACE(@SQL, ''''{LIST_TABLE}'''', @listTableName)
				EXEC sp_executesql @SQL
		'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}] EXEC(''
			CREATE PROCEDURE uspDeleteList
				@list_name NVARCHAR(150),
				@list_table NVARCHAR(150),
				@analysis_table NVARCHAR(150)
			AS
				DECLARE @FOLDER_SQL NVARCHAR(MAX)
				DECLARE @LIST_SQL NVARCHAR(MAX)
				DECLARE @ANALYSIS_SQL NVARCHAR(MAX)
				DECLARE @LIST_ID INT
				SET @LIST_ID = (SELECT id FROM Lists WHERE list_name = @list_name AND list_table_name = @list_table AND list_analysis_table_name = @analysis_table)
				-- Deleting folder items first
				SET @FOLDER_SQL = ''''DELETE FROM FolderItems WHERE list_id = {LIST_ID}''''
				SET @FOLDER_SQL = REPLACE(@FOLDER_SQL, ''''{LIST_ID}'''', @LIST_ID)
				EXEC sp_executesql @FOLDER_SQL

				-- Deleting list & analysis tables
				SET @LIST_SQL = REPLACE(@LIST_SQL, ''''{LIST_TABLE}'''', @list_table)
				SET @LIST_SQL = ''''DROP TABLE IF EXISTS [{LIST_TABLE}]''''
				SET @ANALYSIS_SQL = ''''DROP TABLE IF EXISTS [{ANALYSIS_TABLE}]''''
				DELETE from Lists WHERE id = @LIST_ID
				DELETE from Analyses WHERE list_id = @LIST_ID
				DELETE from dbo.[Analyses-Dashboard] WHERE list_id = @LIST_ID
				SET @LIST_SQL = REPLACE(@LIST_SQL, ''''{LIST_TABLE}'''', @list_table)
				SET @ANALYSIS_SQL = REPLACE(@ANALYSIS_SQL, ''''{ANALYSIS_TABLE}'''', @analysis_table)
				EXEC sp_executesql @LIST_SQL
				EXEC sp_executesql @ANALYSIS_SQL
		'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		-- Roll back STORED PROCEDURES
		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspDropOrganizationTable
							@table_name NVARCHAR(150)
						AS
							DECLARE @TEMPLATE NVARCHAR(MAX)
							DECLARE @SQL NVARCHAR(MAX)

							SET @TEMPLATE = ''''DROP TABLE IF EXISTS [{TABLE_NAME}]''''
							SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', @table_name)
						 	EXEC sp_executesql @SQL '')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspDeleteOrganizationTableRow
							@table_name NVARCHAR(150),
							@primary_key INT,
							@column NVARCHAR(150)
						AS
							DECLARE @TEMPLATE NVARCHAR(MAX)
							DECLARE @SQL NVARCHAR(MAX)

							SET @TEMPLATE = ''''DELETE FROM [{TABLE_NAME}] WHERE {COLUMN} = {PRIMARY_KEY}''''
							SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', @table_name)
							SET @SQL = REPLACE(@SQL, ''''{COLUMN}'''', @column)
							SET @SQL = REPLACE(@SQL, ''''{PRIMARY_KEY}'''', @primary_key)
						 	EXEC sp_executesql @SQL '')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE dbo.uspUpdateAccountProfile
						@orgName NVARCHAR(200),
						@orgAddress NVARCHAR(200),
						@orgWebsite NVARCHAR(200),
						@isSubsidiary BIT = 0,
						@orgParent NVARCHAR(200) = ''''''''
					AS
						UPDATE AccountProfile SET
						organization_name = @orgName,
						organization_address = @orgAddress,
						organization_website = @orgWebsite,
						organization_is_subsidiary = @isSubsidiary,
						organization_parent = @orgParent'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspUpdateAccountClassifications
							@classification_ids VARCHAR(200)
						AS
							-- Remove old classifications.
							DELETE FROM AccountClassifications

							--Add new classifications.
							DECLARE @pos INT
							DECLARE @len INT
							DECLARE @strClassificationId varchar(20)
							DECLARE @nClassificationId INT

							SET @pos = 1
							WHILE CHARINDEX('''','''', @classification_ids, @pos) > 0
							BEGIN
								SET @len = CHARINDEX('''','''', @classification_ids, @pos)
								SET @strClassificationId = SUBSTRING(@classification_ids, @pos, @len - @pos)
								SET @nClassificationId = CAST(@strClassificationId AS INT)
								INSERT INTO AccountClassifications VALUES(@nClassificationId)
								set @pos = @len + 1
							END
							SET @strClassificationId = SUBSTRING(@classification_ids, @pos, LEN(@classification_ids) - @pos + 1)
							SET @nClassificationId = CAST(@strClassificationId AS INT)
							INSERT INTO AccountClassifications VALUES(@nClassificationId)'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspUpdateUserCommodities
							@userID INT,
							@commodity_ids VARCHAR(200)
						AS
							-- Remove old commodities for the user.
							DELETE FROM UserCommodities WHERE user_id = @userID

							--Add new commodities for the user.
							DECLARE @pos INT
							DECLARE @len INT
							DECLARE @strCommoditiyId varchar(20)
							DECLARE @nCommodityId INT

							SET @pos = 1
							WHILE CHARINDEX('''','''', @commodity_ids, @pos) > 0
							BEGIN
								SET @len = CHARINDEX('''','''', @commodity_ids, @pos)
								SET @strCommoditiyId = SUBSTRING(@commodity_ids, @pos, @len - @pos)
								SET @nCommodityId = CAST(@strCommoditiyId AS INT)
								INSERT INTO UserCommodities(user_id, commodity_id) VALUES(@userID, @nCommodityId)
								SET @pos = @len + 1
							END
							SET @strCommoditiyId = SUBSTRING(@commodity_ids, @pos, LEN(@commodity_ids) - @pos + 1)
							SET @nCommodityId = CAST(@strCommoditiyId AS INT)
							INSERT INTO UserCommodities(user_id, commodity_id) VALUES(@userID, @nCommodityId)'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspUpdateUserGeographies
							@userID INT,
							@geography_ids VARCHAR(200)
						AS
							-- Remove old geographies for the user.
							DELETE FROM UserGeographies WHERE user_id = @userID

							DECLARE @pos INT
							DECLARE @len INT
							DECLARE @strGeographyId varchar(20)
							DECLARE @nGeographyId INT

							SET @pos = 1
							WHILE CHARINDEX('''','''', @geography_ids, @pos) > 0
							BEGIN
								SET @len = CHARINDEX('''','''', @geography_ids, @pos)
								SET @strGeographyId = SUBSTRING(@geography_ids, @pos, @len - @pos)
								SET @nGeographyId = CAST(@strGeographyId AS INT)
								INSERT INTO UserGeographies(user_id,geography_id) VALUES(@userID, @nGeographyId)
								SET @pos = @len +1
							END
							SET @strGeographyId = SUBSTRING(@geography_ids, @pos, LEN(@geography_ids) - @pos + 1)
							SET @nGeographyId = CAST(@strGeographyId AS INT)
							INSERT INTO UserGeographies(user_id,geography_id) VALUES(@userID, @nGeographyId)'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}] EXEC(''
			CREATE PROCEDURE dbo.uspGetUserStatus
				@user_id INT
			AS
				SELECT status_id FROM Users WHERE id = @user_id
		'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspGetUserInfo
							@userID INT
						AS
							-- Obtain User Commodities Info.
							DECLARE @arrCommodities NVARCHAR(100)
							SELECT @arrCommodities = COALESCE(@arrCommodities + '''','''', '''''''') + CONVERT(varchar(3), commodity_id)
							FROM UserCommodities WHERE user_id = @userID

							-- Obtain User Geographies Info.
							DECLARE @arrGeographies NVARCHAR(100)
							SELECT @arrGeographies = COALESCE(@arrGeographies + '''','''', '''''''') + CONVERT(varchar(3), geography_id)
							FROM UserGeographies WHERE user_id = @userID

							SELECT id, first_name, middle_initial, last_name, email, phone, title_id, other_title, access_level_id, status_id, email_subscription,
							@arrCommodities AS user_commodity_ids, @arrGeographies AS user_geography_ids,
							viirs_email_frequency, glad_email_frequency, forma_email_frequency, terrai_email_frequency, gran_chaco_email_frequency
							FROM Users WHERE id = @userID'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspGetUserInfoByEmail
							@userEmail NVARCHAR(50)
						AS
							SELECT
							U.id, U.first_name, U.middle_initial, U.last_name, U.email, U.phone,
							U.title_id, U.other_title, U.access_level_id, U.status_id, U.email_subscription
							FROM Users U
							LEFT JOIN UserCommodities UC ON U.id = UC.user_id
							LEFT JOIN UserGeographies UG ON U.id = UG.user_id
							WHERE U.email = @userEmail'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		
		SET @TEMPLATE = 'USE [{DATABASENAME}]
							EXEC(''CREATE PROCEDURE dbo.uspGetListLocations
									@listID INT,
                                    @locationID INT,
                                    @rowsRequested INT
                                AS
                                --DECLARE IMPORTANT VARIABLES
                                DECLARE @listLocationTableName NVARCHAR(1000)
                                DECLARE @locationWhereStatement NVARCHAR(MAX)
                                DECLARE @listLocationTableCols NVARCHAR(MAX)
                                DECLARE @SQL NVARCHAR(MAX)

                                -- Obtain the location table name and the analysis table name for the list.
                                SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @listID

                                -- Obtain the needed columns from the List Location Table. (All but Geometry)
                                SELECT @listLocationTableCols = STUFF(
                                    (
                                        SELECT ''''], L.['''' + [name] FROM sys.columns
                                        WHERE
                                            [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
                                            AND [name] NOT IN (''''Geometry'''')
                                            FOR XML PATH('''''''')
                                    ),1,3,'''''''') + '''']'''';

                                -- Return data 
                                IF @rowsRequested > 0 
                                    BEGIN
                                        SET @SQL = ''''SELECT TOP ({NUM_ROWS}) {LIST_ID} As list_id, {LOCATION_COLUMNS}, L.Geometry.ToString() as [WKTGeometry]
                                                    FROM [{LOCATION_TABLE}] L
                                                    WHERE location_id >= {MIN_LOCATION_ID}
                                                    ORDER BY location_id'''';
                                        SET @SQL = REPLACE(@SQL, ''''{NUM_ROWS}'''', @rowsRequested);
                                        SET @SQL = REPLACE(@SQL, ''''{MIN_LOCATION_ID}'''', @locationID);
                                    END
                                ELSE
                                    BEGIN
                                        SET @SQL = ''''SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS}, L.Geometry.ToString() as [WKTGeometry]
                                                    FROM [{LOCATION_TABLE}] L'''';
                                    END

                                SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listID);
                                SET @SQL = REPLACE(@SQL, ''''{LOCATION_COLUMNS}'''', @listLocationTableCols);
                                SET @SQL = REPLACE(@SQL, ''''{LOCATION_TABLE}'''', @listLocationTableName);


                                EXEC sp_executesql @SQL;
						'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
							EXEC(''CREATE PROCEDURE dbo.uspGetSimplifiedListLocations
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
									SELECT ''''], L.['''' + [name] FROM sys.columns
									WHERE
										[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
										AND [name] NOT IN (''''Geometry'''')
										FOR XML PATH('''''''')
								),1,3,'''''''') + '''']'''';

							-- Return data from both tables
							SET @SQL = ''''SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS}, L.Geometry.Reduce(0.008).ToString() as [WKTGeometry] FROM [{LOCATION_TABLE}] L'''';
							SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listID);
							SET @SQL = REPLACE(@SQL, ''''{LOCATION_COLUMNS}'''', @listLocationTableCols);
							SET @SQL = REPLACE(@SQL, ''''{LOCATION_TABLE}'''', @listLocationTableName);
							EXEC sp_executesql @SQL
						'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}] EXEC(''
			CREATE PROCEDURE dbo.uspGetDashboardData
				@listId INT
			AS
			BEGIN
				SET NOCOUNT ON;

				DECLARE @template_id INT
				DECLARE @name_field NVARCHAR(50)
				DECLARE @list_table_name NVARCHAR(150)

				SELECT @list_table_name = list_table_name, @template_id = template_id FROM dbo.Lists WHERE id = @listId
				SET @name_field = CASE WHEN @template_id = 1 THEN ''''[Investment Name]'''' ELSE ''''[Location Name]'''' END
				
				DECLARE @TEMPLATE NVARCHAR(MAX)

				DECLARE @SQL NVARCHAR(MAX) 

				SET @TEMPLATE = ''''
						SELECT AD.list_id,
							AD.location_id,
							AD.gadm_id,
							AD.glad_alerts_coverage AS gladAlerts,
							AD.glad_alerts_daily,
							AD.glad_alerts_weekly,
							AD.glad_alerts_monthly,
							AD.viirs_alerts_daily,
							AD.tree_cover_extent_total,
							AA.[Country],
							AA.[State],
							AA.[Sub State],			     
							--AA.Geometry.ToString() AS [WKTGeometry],
							AA.[Location Name] AS name_all,
							AA.[gadmid],	
							AA.gadmid AS gadmid_2,
							AA.Latitude AS gadmid_2_lat, AA.Longitude AS gadmid_2_lon,
							S.gadmid AS gadmid_1, S.Latitude AS gadmid_1_lat, S.Longitude AS gadmid_1_lon,
							C.gadmid AS gadmid_0, C.Latitude AS gadmid_0_lat, C.Longitude AS gadmid_0_lon,
							L.location_lat, L.location_lon,
							L.location_name
						FROM dbo.[Analyses-Dashboard] AD
						LEFT JOIN gfwpro.dbo.[list-administrativeAreas] AA ON AA.gadmid = AD.gadm_id
						LEFT JOIN (SELECT * FROM gfwpro.dbo.[list-administrativeAreas] WHERE [Sub State] IS NULL) S ON S.Country = AA.Country AND S.State = AA.State
						LEFT JOIN (SELECT * FROM gfwpro.dbo.[list-administrativeAreas] WHERE State IS NULL) C ON C.Country = AA.Country	
						LEFT JOIN (SELECT {NAME_FIELD} AS location_name, location_id, longitude AS location_lon, latitude AS location_lat FROM [{LIST_TABLE}]) L ON L.location_id = AD.location_id
						WHERE AD.list_id = {LIST_ID}
						ORDER BY AD.location_id 
				''''
				SET @SQL = REPLACE(@TEMPLATE, ''''{LIST_ID}'''', @listId)	
				SET @SQL = REPLACE(@SQL, ''''{LIST_TABLE}'''', @list_table_name)
				SET @SQL = REPLACE(@SQL, ''''{NAME_FIELD}'''', @name_field)	
				EXEC sp_executesql @SQL
			END
		'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}] EXEC(''
			CREATE PROCEDURE dbo.uspGetDashboardCommodityLocations
				@listId INT
			AS
				DECLARE @listTable NVARCHAR(1000)
				DECLARE @analysisTable NVARCHAR(1000)
				SELECT @listTable = list_table_name, @analysisTable = list_analysis_table_name FROM Lists WHERE id = @listId

				DECLARE @SQL NVARCHAR(MAX)
				SET @SQL = ''''
					SELECT {LIST_ID} AS list_id,LT.[Latitude],LT.[Longitude],LT.[location_id],LT.[Location Name],LT.[Country],LT.[State],LT.[Sub State],LT.[gadmid],LT.Geometry.ToString() AS [WKTGeometry]
					FROM [{LIST_TABLE}] LT JOIN [{ANALYSIS_TABLE}] AT
					ON LT.location_id = AT.location_id
					WHERE AT.location_status_id = 2
				''''
				SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listId)
				SET @SQL = REPLACE(@SQL, ''''{LIST_TABLE}'''', @listTable)
				SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_TABLE}'''', @analysisTable)
				EXEC sp_executesql @SQL
		'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}] EXEC(''
			CREATE PROCEDURE dbo.uspGetDashboardInvestmentLocations
				@listId INT
			AS
				DECLARE @listTable NVARCHAR(1000)
				DECLARE @analysisTable NVARCHAR(1000)
				SELECT @listTable = list_table_name, @analysisTable = list_analysis_table_name FROM Lists WHERE id = @listId

				DECLARE @SQL NVARCHAR(MAX)
				SET @SQL = ''''
					SELECT {LIST_ID} AS list_id,LT.[location_id],LT.[Latitude],LT.[Longitude],LT.[Investment Name] AS [Location Name],LT.[Country],LT.[State],LT.[Sub State],LT.[gadmid],LT.Geometry.ToString() AS [WKTGeometry]
					FROM [{LIST_TABLE}] LT JOIN [{ANALYSIS_TABLE}] AT
					ON LT.location_id = AT.location_id
					WHERE AT.location_status_id = 2
				''''
				SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listId)
				SET @SQL = REPLACE(@SQL, ''''{LIST_TABLE}'''', @listTable)
				SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_TABLE}'''', @analysisTable)
				EXEC sp_executesql @SQL
		'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspGetDashboardDissolvedS3Location
					@listId INT
				AS
					SELECT dissolved_geom_object_key FROM Analyses WHERE list_id = @listId
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspGetListErrorFiles
					@list_id SMALLINT NULL

				AS
				BEGIN
					IF @list_id IS NOT NULL
						SELECT error_file_storage_path
						FROM dbo.Lists
						WHERE error_file_storage_path IS NOT NULL AND id = @list_id
			
					ELSE
						SELECT id, error_file_storage_path
						FROM dbo.Lists
						WHERE error_file_storage_path IS NOT NULL
				END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspGetListVectorTilesPath
					@list_id SMALLINT

				AS
				BEGIN
					SELECT vector_tiles_storage_path
					FROM dbo.Lists
					WHERE id = @list_id
				END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspGetListsDashboardTimestamp
					@timestamp DATETIME2 NULL,
					@list_id SMALLINT NULL

				AS
				BEGIN
					IF @list_id IS NULL
						SELECT id
						FROM dbo.Lists WHERE dashboard_last_submit = @timestamp

					ELSE
						SELECT dashboard_last_results
						FROM dbo.Lists WHERE id = @list_id
				END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspSetDashboardTimestamp
					@list_id_array NVARCHAR(MAX),
					@column_name NVARCHAR(50),
					@value DATETIME2
				AS
				BEGIN
					SET NOCOUNT ON;

					DECLARE @SQL NVARCHAR(MAX)


					SET @SQL = ''''
						BEGIN TRANSACTION
							UPDATE [Lists]
							SET {COLUMN_NAME} = ''''''''{VALUE}''''''''
							WHERE id IN ({LIST_IDS})
						COMMIT TRANSACTION
					''''

					SET @SQL = REPLACE(@SQL, ''''{COLUMN_NAME}'''', @column_name)
					SET @SQL = REPLACE(@SQL, ''''{VALUE}'''', @value)
					SET @SQL = REPLACE(@SQL, ''''{LIST_IDS}'''', @list_id_array)
					EXEC sp_executesql @SQL

				END

			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetListLocationsNoGeom
							@listID INT,
							@ColumnsToReturn NVARCHAR(MAX) = NULL

						AS
							--DECLARE IMPORTANT VARIABLES
							DECLARE @listLocationTableName NVARCHAR(1000)
							DECLARE @listLocationTableCols NVARCHAR(MAX)
							DECLARE @columnsList NVARCHAR(MAX)
							DECLARE @SQL NVARCHAR(MAX)

							-- Obtain the location table name and the analysis table name for the list.
							SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @listID


							IF @ColumnsToReturn IS NOT NULL
								BEGIN
									DECLARE @PRESQL NVARCHAR(MAX);
									DECLARE @presql_list_params NVARCHAR(MAX) = ''''@list_location_table_cols_query VARCHAR(MAX) OUTPUT'''';

									WITH ColumnsCTE AS (
										SELECT TRIM(value) AS cols FROM STRING_SPLIT(@ColumnsToReturn, '''','''')
									)

									SELECT @columnsList = CONCAT('''''''''''''''', STRING_AGG(cols, '''''''''''', ''''''''''''), '''''''''''''''')
									FROM ColumnsCTE;

									-- Obtain the needed columns from the List Location Table. 
									SET @PRESQL = N''''SELECT @list_location_table_cols_query = STUFF(
										  (
											SELECT ''''''''], L.['''''''' + [name] FROM sys.columns
											WHERE
											  [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = ''''''''{LIST_LOCATION_TABLE_NAME}'''''''')
											  AND [name] IN ({COLUMNS_LIST}) 
											  FOR XML PATH('''''''''''''''')
										  ),1,3,'''''''''''''''') + '''''''']'''''''''''';
									SET @PRESQL = REPLACE(@PRESQL, ''''{LIST_LOCATION_TABLE_NAME}'''', @listLocationTableName)
									SET @PRESQL = REPLACE(@PRESQL, ''''{COLUMNS_LIST}'''', @columnsList);

									EXEC sp_executesql @PRESQL, @presql_list_params, @list_location_table_cols_query = @listLocationTableCols OUTPUT;

								END

							ELSE
								BEGIN

									-- Obtain the needed columns from the List Location Table. (All but Geometry)
									SELECT @listLocationTableCols = STUFF(
										(
											SELECT ''''], L.['''' + [name] FROM sys.columns
											WHERE
												[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
												AND [name] NOT IN (''''Geometry'''')
												FOR XML PATH('''''''')
										),1,3,'''''''') + '''']'''';
								END

							-- Return data from both tables
							SET @SQL = ''''SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS} FROM [{LOCATION_TABLE}] L'''';
							SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listID);
							SET @SQL = REPLACE(@SQL, ''''{LOCATION_COLUMNS}'''', @listLocationTableCols);
							SET @SQL = REPLACE(@SQL, ''''{LOCATION_TABLE}'''', @listLocationTableName);
							EXEC sp_executesql @SQL
						'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetListTemplateInfo
							@list_table NVARCHAR(150)
						AS
							--Obtain the template id and location classification for the list.
							SELECT template_id, location_classification FROM Lists WHERE list_table_name = @list_table
						'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetLocation
							@list_table NVARCHAR(150),
							@location_id INT
						AS
							DECLARE @LIST_TEMPLATE_ID INT
							DECLARE @LOCATION_CLASSIFICATION NVARCHAR(150)
							DECLARE @SQL NVARCHAR(MAX)

							--Obtain the template id and location classification for the list.
							SELECT @LIST_TEMPLATE_ID = template_id, @LOCATION_CLASSIFICATION = location_classification FROM Lists WHERE list_table_name = @list_table

							SET @SQL = ''''
								SELECT location_id, {LIST_TEMPLATE_ID} AS [template_id], ''''''''{LOCATION_CLASSIFICATION}'''''''' AS location_classification, Geometry.ToString() as [WKTGeometry]
								FROM [{TABLE_NAME}]
								WHERE location_id = {LOCATION_ID}
								''''
								SET @SQL = REPLACE(@SQL, ''''{TABLE_NAME}'''', @list_table)
								SET @SQL = REPLACE(@SQL, ''''{LOCATION_ID}'''', @location_id)
								SET @SQL = REPLACE(@SQL, ''''{LIST_TEMPLATE_ID}'''', @LIST_TEMPLATE_ID)
								SET @SQL = REPLACE(@SQL, ''''{LOCATION_CLASSIFICATION}'''', @LOCATION_CLASSIFICATION)
								EXEC sp_executesql @SQL'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetAllLocations
							@list_table NVARCHAR(150)
						AS
							DECLARE @LIST_TEMPLATE_ID INT
							DECLARE @LOCATION_CLASSIFICATION NVARCHAR(150)
							DECLARE @TEMPLATE NVARCHAR(MAX)
							DECLARE @SQL NVARCHAR(MAX)

							--Obtain the template id and location classification for the list.
							SELECT @LIST_TEMPLATE_ID = template_id, @LOCATION_CLASSIFICATION = location_classification FROM Lists WHERE list_table_name = @list_table

							SET @TEMPLATE = ''''
								SELECT location_id, {LIST_TEMPLATE_ID} AS [template_id], ''''''''{LOCATION_CLASSIFICATION}'''''''' AS location_classification, Geometry.ToString() as [WKTGeometry]
								FROM [{TABLE_NAME}]
								''''
								SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', @list_table)
								SET @SQL = REPLACE(@SQL, ''''{LIST_TEMPLATE_ID}'''', @LIST_TEMPLATE_ID)
								SET @SQL = REPLACE(@SQL, ''''{LOCATION_CLASSIFICATION}'''', @LOCATION_CLASSIFICATION)
								EXEC sp_executesql @SQL'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetLocationsForBatchProcessing
							@list_id INT
						AS														
							DECLARE	@list_table NVARCHAR(150)
							DECLARE @analysis_table NVARCHAR(150)

							DECLARE @SQL NVARCHAR(MAX)

							--Obtain the template id and location classification for the list.
							SELECT @list_table = list_table_name FROM dbo.Lists WHERE id = @list_id
							SELECT @analysis_table = list_analysis_table_name FROM dbo.Lists WHERE id = @list_id

							SET @SQL = ''''
								SELECT L.location_id, CONVERT(VARCHAR(MAX),L.Geometry.STAsBinary(), 2) AS [geom]
									, CASE 
										WHEN A.location_status_id IS NULL OR A.total_area = 0 THEN ''''''''New''''''''
										ELSE ''''''''Existing''''''''
									END AS location_status
									FROM [{LIST_TABLE_NAME}] L
									LEFT JOIN(
										SELECT *
										FROM  [{ANALYSIS_TABLE_NAME}]
										WHERE location_status_id = 2
									) A ON A.location_id = L.location_id
							''''
							SET @SQL = REPLACE(@SQL, ''''{LIST_TABLE_NAME}'''', @list_table)
							SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_TABLE_NAME}'''', @analysis_table)
							EXEC sp_executesql @SQL'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspUpdateLocationAnalysisStatusInBulk 
							@analysis_table_name NVARCHAR(150),
							@location_ids_array NVARCHAR(MAX),
							@location_status_id TINYINT
						AS
						BEGIN
							DECLARE @SQL NVARCHAR(MAX)

							SET @SQL = ''''
								BEGIN TRANSACTION
									UPDATE [{ANALYSIS_TABLE}]
									SET location_status_id = {LOCATION_STATUS_ID}
									WHERE location_id IN ({LOCATION_IDS})
								COMMIT TRANSACTION
							''''

							SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_TABLE}'''', @analysis_table_name)
							SET @SQL = REPLACE(@SQL, ''''{LOCATION_STATUS_ID}'''', @location_status_id)
							SET @SQL = REPLACE(@SQL, ''''{LOCATION_IDS}'''', @location_ids_array)
							EXEC sp_executesql @SQL
						END					
						'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE [dbo].[uspGetListStatus]
							@list_id INT
						AS
							BEGIN
								SELECT list_status_id FROM dbo.[Lists] WHERE id = @list_id
							END
						'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE [dbo].[uspUpdateListCount]
				@table_name NVARCHAR(150),
				@list_id INT
			AS
				DECLARE @SQL NVARCHAR(MAX)
				SET @SQL = ''''
					UPDATE Lists
					SET list_locations_count = (
						SELECT COUNT (*)
						FROM [{TABLE_NAME}]
					)
					WHERE id = {LIST_ID}''''
				SET @SQL = REPLACE(@SQL, ''''{TABLE_NAME}'''', @table_name)
				SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @list_id)
				EXEC sp_executesql @SQL'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE [dbo].[uspGetListAnalysis]
				@list_id INT
			AS
				SELECT * FROM Analyses WHERE list_id = @list_id
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
		USE [{DATABASENAME}]
		EXEC(''
			CREATE PROCEDURE uspAddNewLocationToAnalysisTable
				@list_id INT,
				@start_location_id INT
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
				SET @TEMPLATE = ''''
					INSERT INTO [{ANALYSIS_TABLE}](location_id, location_status_id)
						SELECT location_id, 1
						FROM [{LIST_TABLE}]
						WHERE location_id > {START_LOCATION_ID}
				''''
				SET @SQL = REPLACE(@TEMPLATE, ''''{ANALYSIS_TABLE}'''', @analyisTableName)
				SET @SQL = REPLACE(@SQL, ''''{LIST_TABLE}'''', @listTableName)
				SET @SQL = REPLACE(@SQL, ''''{START_LOCATION_ID}'''', @start_location_id)
				EXEC sp_executesql @SQL

				DECLARE @TEMPLATE2 NVARCHAR(1000)
				DECLARE @SQL2 NVARCHAR(1000)

				SET @TEMPLATE2 = ''''
					SELECT location_id, Geometry.ToString() as WKTGeometry
					FROM [{LIST_TABLE}]
					WHERE location_id > {START_LOCATION_ID}
				''''

				SET @SQL2 = REPLACE(@TEMPLATE2, ''''{LIST_TABLE}'''', @listTableName)
				SET @SQL2 = REPLACE(@SQL2, ''''{START_LOCATION_ID}'''', @start_location_id)
				EXEC sp_executesql @SQL2
		'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE [dbo].[uspCopyGFWLocationAnalysis]
					@dest_list_id INT,
					@dest_location_id INT,
					@src_list_id INT,
					@src_location_id INT,
					@statement NVARCHAR(MAX)
				AS
				BEGIN
					-- SET NOCOUNT ON added to prevent extra result sets from
					-- interfering with SELECT statements.
					SET NOCOUNT ON;

					DECLARE @SRC_TABLE NVARCHAR(150)
					DECLARE @DEST_TABLE NVARCHAR(150)
					DECLARE @SQL NVARCHAR(MAX)

					SET @SRC_TABLE = (SELECT list_analysis_table_name FROM gfwpro.dbo.GFWLists WHERE id = @src_list_id)
					SET @DEST_TABLE = (SELECT list_analysis_table_name FROM Lists WHERE id = @dest_list_id)

					SET @SQL = ''''
						UPDATE [{DEST_TABLE}]
						SET {STATEMENT}
						FROM gfwpro.dbo.[{SRC_TABLE}]
						WHERE gfwpro.dbo.[{SRC_TABLE}].location_id = {SRC_LOCATION_ID} AND [{DEST_TABLE}].location_id = {DEST_LOCATION_ID}
					''''

					SET @SQL = REPLACE(@SQL, ''''{DEST_TABLE}'''', @DEST_TABLE)
					SET @SQL = REPLACE(@SQL, ''''{SRC_TABLE}'''', @SRC_TABLE)
					SET @SQL = REPLACE(@SQL, ''''{STATEMENT}'''', @statement)
					SET @SQL = REPLACE(@SQL, ''''{SRC_LOCATION_ID}'''', @src_location_id)
					SET @SQL = REPLACE(@SQL, ''''{DEST_LOCATION_ID}'''', @dest_location_id)
					EXEC sp_executesql @SQL
			
					SET @SQL = ''''
						UPDATE [{DEST_TABLE}]
						SET location_status_id = 3
						WHERE location_status_id = 1
					''''
					SET @SQL = REPLACE(@SQL, ''''{DEST_TABLE}'''', @DEST_TABLE)
					EXEC sp_executesql @SQL
				END
		'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL
		
		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE [dbo].[uspGetListGeometries]
					@list_table NVARCHAR(500)
				AS
					DECLARE @TEMPLATE NVARCHAR(1000)
					DECLARE @SQL NVARCHAR(1000)

					SET  @TEMPLATE = ''''SELECT Geometry.ToString() as [WKTGeometry] FROM [{TABLE}]''''

					SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE}'''', @list_table)
					EXEC sp_executesql @SQL
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE [dbo].[uspSetAnalysisLocationPending]
				@list_id INT,
				@start_location_id INT
			AS
				DECLARE @analyisTableName NVARCHAR(150)
				DECLARE @TEMPLATE NVARCHAR(1000)
				DECLARE @SQL NVARCHAR(1000)

				SET @analyisTableName = (
					SELECT list_analysis_table_name
					FROM Lists
					WHERE id = @list_id
				)

				SET @TEMPLATE = ''''
					UPDATE [{ANALYSIS_TABLE}]
					SET location_status_id = 1
					WHERE location_id > {START_LOCATION_ID}
				''''
				SET @SQL = REPLACE(@TEMPLATE, ''''{ANALYSIS_TABLE}'''', @analyisTableName)
				SET @SQL = REPLACE(@SQL, ''''{START_LOCATION_ID}'''', @start_location_id)

				EXEC sp_executesql @SQL'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
		  USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE uspGetMaxId
					@list_id INT
				AS
					DECLARE @ANALYSIS_TABLE NVARCHAR(150)
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)

					SET @ANALYSIS_TABLE = (
						SELECT list_table_name
						FROM Lists
						WHERE id = @list_id
					)

					SET @TEMPLATE = ''''SELECT MAX(location_id) as max_id from [{TABLE_NAME}]''''

					SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', @ANALYSIS_TABLE)
					EXEC sp_executesql @SQL
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE dbo.uspGetTableColumns
			@list_id INT
			AS
				SELECT COLUMN_NAME, DATA_TYPE
				FROM INFORMATION_SCHEMA.COLUMNS
				WHERE TABLE_NAME = (
					SELECT list_table_name
					FROM Lists
					WHERE id = @list_id
				)'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspGetAnalysisColumns
					@list_id INT
				AS
					SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
					WHERE TABLE_NAME = (SELECT list_analysis_table_name FROM Lists WHERE id = @list_id) AND COLUMN_NAME != ''''id'''' AND COLUMN_NAME != ''''location_id''''
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetUsersList
						AS
							-- Create a Table Variable to store the compiled user data  for the company.
							DECLARE @CompiledUsers TABLE
							(
								[first_name] NVARCHAR(35) NOT NULL,
								[middle_initial] NVARCHAR(2) NOT NULL,
								[last_name] NVARCHAR(35) NOT NULL,
								[email] NVARCHAR(50) NOT NULL,
								[phone] VARCHAR(50) NOT NULL,
								[title_id] INT NOT NULL,
								[other_title] NVARCHAR(150),
								[access_level_id] INT NOT NULL,
								[user_commodity_ids] NVARCHAR(100) NULL,
								[user_geography_ids] NVARCHAR(100) NULL,
								[email_subscription] BIT NOT NULL,
								[auth_preference_id] INT NOT NULL,
								[status_id] INT NOT NULL,
								[activated_time] SMALLDATETIME,
								[user_id] INT NULL,
								[viirs_email_frequency] INT,
								[glad_email_frequency] INT,
								[forma_email_frequency] INT,
								[terrai_email_frequency] INT,
								[gran_chaco_email_frequency] INT
							)

							-- Setup a new cursor to go through each user.
							DECLARE @userID INT
							DECLARE user_cursor CURSOR FOR
							SELECT id FROM Users WHERE is_system_user = 0

							-- Loop through each user and create compiled data.
							OPEN user_cursor
							FETCH NEXT FROM user_cursor
							INTO @userID
							WHILE  @@FETCH_STATUS = 0
							BEGIN
								-- Obtain User Information.
								DECLARE @first_name NVARCHAR(35)
								DECLARE @middle_initial NVARCHAR(2)
								DECLARE @last_name NVARCHAR(35)
								DECLARE @email NVARCHAR(50)
								DECLARE @phone VARCHAR(50)
								DECLARE @email_subscription INT
								DECLARE @auth_preference_id INT
								DECLARE @title_id INT
								DECLARE @other_title NVARCHAR(150)
								DECLARE @access_level_id INT
								DECLARE @status_id INT
								DECLARE @status_level VARCHAR(30)
								DECLARE @activated_time SMALLDATETIME
								DECLARE @viirs_email_frequency INT
								DECLARE @glad_email_frequency INT
								DECLARE @forma_email_frequency INT
								DECLARE @terrai_email_frequency INT
								DECLARE @gran_chaco_email_frequency INT

								SELECT @first_name = first_name, @middle_initial = middle_initial,
								@last_name = last_name, @email = email, @phone = phone, @title_id = title_id, @other_title = other_title,
								@access_level_id = access_level_id, @status_id = status_id,
								@email_subscription = email_subscription, @activated_time = activated_time,
								@viirs_email_frequency = viirs_email_frequency, @glad_email_frequency = glad_email_frequency, @forma_email_frequency = forma_email_frequency,
								@terrai_email_frequency = terrai_email_frequency, @gran_chaco_email_frequency = gran_chaco_email_frequency
								FROM Users WHERE id = @userID

								-- Obtain User Commodities Info.
								DECLARE @arrCommodities NVARCHAR(100)
								SELECT @arrCommodities = COALESCE(@arrCommodities + '''','''', '''''''') + CONVERT(varchar(3), commodity_id)
								FROM UserCommodities WHERE [user_id] = @userID

								-- Obtain User Geographies Info.
								DECLARE @arrGeographies NVARCHAR(100)
								SELECT @arrGeographies = COALESCE(@arrGeographies + '''','''', '''''''') + CONVERT(varchar(3), geography_id)
								FROM UserGeographies WHERE [user_id] = @userID

								-- Set Auth Preference. TO-DO
								SET @auth_preference_id = 0

								-- Insert Row with data into compiled table.
								INSERT INTO @CompiledUsers
								VALUES(@first_name, @middle_initial, @last_name, @email, @phone, @title_id, @other_title, @access_level_id,
									@arrCommodities, @arrGeographies, @email_subscription, @auth_preference_id, @status_id, @activated_time, @userID,
									@viirs_email_frequency, @glad_email_frequency, @forma_email_frequency, @terrai_email_frequency, @gran_chaco_email_frequency)

								-- Fetch Next Row.
								FETCH NEXT FROM user_cursor
								INTO @userID

								--Reset arrays for next pass.
								SET @arrCommodities = NULL
								SET @arrGeographies = NULL
							END
							CLOSE user_cursor
							DEALLOCATE user_cursor

							SELECT * FROM @CompiledUsers'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspShareInternalList
							@admin_id INT,
							@user_id INT,
							@list_id INT,
							@datetime DATETIME
						AS
							INSERT INTO InternalShareRoutes(admin_id, user_id, list_id, datetime) VALUES (@admin_id, @user_id, @list_id, @datetime)'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspActivateShareInternalList
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
								list_id = @list_id'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspDeactivateShareInternalList
							@user_id INT,
							@list_id INT
						AS
							DELETE FROM InternalShareRoutes
							WHERE
								user_id = @user_id AND
								list_id = @list_id

							DELETE FROM [dbo].[FolderItems] WHERE folder_id IN (SELECT id FROM [Folders] WHERE USER_ID = @user_id) AND list_id = @list_id'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspDeactivateAllShareInternalList
							@user_id NVARCHAR(MAX),
							@list_id INT
						AS
							DELETE FROM InternalShareRoutes
							WHERE
								list_id = @list_id AND
								user_id IN (SELECT value FROM STRING_SPLIT(@user_id, '''',''''))

							DELETE FROM [dbo].[FolderItems]
							WHERE folder_id IN (SELECT id FROM [Folders] WHERE USER_ID IN (SELECT value FROM STRING_SPLIT(@user_id, '''',''''))) AND list_id = @list_id'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspGetUserInternalShareLists
							@user_id INT
						AS
							SELECT * FROM InternalShareRoutes
							WHERE
								admin_id = @user_id or
								user_id = @user_id'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspGetUserPendingInternalShareLists
							@user_id INT
						AS
							SELECT * FROM InternalShareRoutes
							WHERE
								user_id = @user_id'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspAdminInternalLists
						AS
							SELECT * FROM InternalShareRoutes'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspGetUsersInternalShareLists
							@list_id INT
						AS
							SELECT * FROM InternalShareRoutes
							WHERE list_id = @list_id'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspGetListUsers
							@list_id INT
						AS
							SELECT * FROM InternalShareRoutes
							WHERE list_id = @list_id'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspGetAccountProfile
							@orgID INT = 0,
							@orgStatusID INT = 0
						AS

							-- Obtain Classifications Information for the Account.
							DECLARE @arrClassificationIds NVARCHAR(100)
							SELECT @arrClassificationIds = COALESCE(@arrClassificationIds + '''','''', '''''''') + CONVERT(VARCHAR(3), classification_id)
							FROM AccountClassifications

							IF (@orgID > 0) AND (@orgStatusID > 0)
								BEGIN
									SELECT @orgID AS organization_id, organization_name, organization_address, organization_website, organization_is_subsidiary,
									organization_parent, @arrClassificationIds AS classification_ids, @orgStatusID AS organization_status_id
									FROM AccountProfile
								END
							ELSE
								BEGIN
									SELECT organization_name, organization_address, organization_website, organization_is_subsidiary,
									organization_parent, @arrClassificationIds AS classification_ids
									FROM AccountProfile
								END'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspSetUserStatus
							@userID INT,
							@statusID INT,
							@activatedTime SMALLDATETIME
						AS
							UPDATE Users SET status_id = @statusID, activated_time = @activatedTime
							WHERE id = @userID'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetActivityLog
						AS
							SELECT U.email, ATC.activity_type_category_name, AT.activity_type_name, AL.activity_description, AL.activity_time
							FROM ActivityLog AL
							LEFT JOIN Users U ON AL.user_id = U.id
							LEFT JOIN gfwpro.dbo.ActivityType AT ON AL.activity_type_id = AT.id
							LEFT JOIN gfwpro.dbo.ActivityTypeCategory ATC ON ATC.id = AT.activity_type_category_id'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspSetActivityLog
							@userID INT,
							@activityTypeID INT,
							@activityDescription NVARCHAR(MAX),
							@activityTime SMALLDATETIME
						AS
							INSERT INTO ActivityLog([user_id], activity_type_id, activity_description, activity_time)
							VALUES(@userID, @activityTypeID, @activityDescription, @activityTime)'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
				EXEC(''CREATE PROCEDURE uspCreateNewUser
					@firstName NVARCHAR(35),
					@mi NVARCHAR(2),
					@lastName NVARCHAR(35),
					@email NVARCHAR(50),
					@phone NVARCHAR(50),
					@titleId INT,
					@other_title NVARCHAR(150),
					@accessLevelId INT,
					@statusId INT,
					@email_subscription BIT,
					@commodity_ids VARCHAR(200),
					@geography_ids VARCHAR(200),
					@viirs_email_frequency INT = 0,
					@glad_email_frequency INT = 0,
					@forma_email_frequency INT = 0,
					@terrai_email_frequency INT = 0,
					@gran_chaco_email_frequency INT = 0
				AS
					-- Insert User into Users Tables.
					INSERT INTO Users(first_name, middle_initial, last_name,
						email, phone, title_id, other_title, access_level_id, status_id, is_system_user, email_subscription,
						viirs_email_frequency, glad_email_frequency, forma_email_frequency, terrai_email_frequency, gran_chaco_email_frequency)
					VALUES(@firstName, @mi, @lastName,
						@email, @phone, @titleId, @other_title, @accessLevelId, @statusId, 0, @email_subscription,
						@viirs_email_frequency, @glad_email_frequency, @forma_email_frequency, @terrai_email_frequency, @gran_chaco_email_frequency)

					--Get Current User ID.
					DECLARE @userID INT
					SET @userID = SCOPE_IDENTITY()

					-- Add Commodity Data.
					DECLARE @pos INT
					DECLARE @len INT
					DECLARE @strCurId varchar(20)
					DECLARE @nCurId INT

					SET @pos = 1
					WHILE CHARINDEX('''','''', @commodity_ids, @pos) > 0
					BEGIN
						SET @len = CHARINDEX('''','''', @commodity_ids, @pos)
						SET @strCurId = SUBSTRING(@commodity_ids, @pos, @len - @pos)
						SET @nCurId = CAST(@strCurId AS INT)
						INSERT INTO [dbo].[UserCommodities] VALUES(@userID, @nCurId)
						set @pos = @len + 1
					END
					SET @strCurId = SUBSTRING(@commodity_ids, @pos, LEN(@commodity_ids) - @pos + 1)
					SET @nCurId = CAST(@strCurId AS INT)
					INSERT INTO [dbo].[UserCommodities] VALUES(@userID, @nCurId)

					-- Add Geography Data.
					SET @pos = 1
					WHILE CHARINDEX('''','''', @geography_ids, @pos) > 0
					BEGIN
						SET @len = CHARINDEX('''','''', @geography_ids, @pos)
						SET @strCurId = SUBSTRING(@geography_ids, @pos, @len - @pos)
						SET @nCurId = CAST(@strCurId AS INT)
						INSERT INTO [dbo].[UserGeographies] VALUES(@userID, @nCurId)
						set @pos = @len + 1
					END
					SET @strCurId = SUBSTRING(@geography_ids, @pos, LEN(@geography_ids) - @pos + 1)
					SET @nCurId = CAST(@strCurId AS INT)
					INSERT INTO [dbo].[UserGeographies] VALUES(@userID, @nCurId)

					SELECT @userID AS NewUserID'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspUpdateUser
							@userID INT,
							@firstName NVARCHAR(35),
							@mi NVARCHAR(2),
							@lastName NVARCHAR(35),
							@email NVARCHAR(50),
							@phone NVARCHAR(50),
							@titleId INT,
							@other_title NVARCHAR(150),
							@accessLevelId INT,
							@email_subscription BIT,
							@commodity_ids VARCHAR(200),
							@geography_ids VARCHAR(200),
							@viirs_email_frequency INT,
							@glad_email_frequency INT,
							@forma_email_frequency INT,
							@terrai_email_frequency INT,
							@gran_chaco_email_frequency INT
						AS
							-- Update User in the Users Tables.
							UPDATE Users SET
							first_name = @firstName,
							middle_initial = @mi,
							last_name = @lastName,
							email = @email,
							phone = @phone,
							title_id = @titleId,
							other_title = @other_title,
							access_level_id = @accessLevelId,
							email_subscription = @email_subscription,
							viirs_email_frequency = @viirs_email_frequency,
							glad_email_frequency = @glad_email_frequency,
							forma_email_frequency = @forma_email_frequency,
							terrai_email_frequency = @terrai_email_frequency,
							gran_chaco_email_frequency = @gran_chaco_email_frequency
							WHERE id = @userID

							-- DELETE Old Commodity Data.
							DELETE FROM UserCommodities WHERE user_id = @userID

							-- Add Commodity Data.
							DECLARE @pos INT
							DECLARE @len INT
							DECLARE @strCurId varchar(20)
							DECLARE @nCurId INT

							SET @pos = 1
							WHILE CHARINDEX('''','''', @commodity_ids, @pos) > 0
							BEGIN
								SET @len = CHARINDEX('''','''', @commodity_ids, @pos)
								SET @strCurId = SUBSTRING(@commodity_ids, @pos, @len - @pos)
								SET @nCurId = CAST(@strCurId AS INT)
								INSERT INTO [dbo].[UserCommodities] VALUES(@userID, @nCurId)
								set @pos = @len + 1
							END
							SET @strCurId = SUBSTRING(@commodity_ids, @pos, LEN(@commodity_ids) - @pos + 1)
							SET @nCurId = CAST(@strCurId AS INT)
							INSERT INTO [dbo].[UserCommodities] VALUES(@userID, @nCurId)

							-- DELETE Old Geography Data.
							DELETE FROM UserGeographies WHERE user_id = @userID

							-- Add Geography Data.
							SET @pos = 1
							WHILE CHARINDEX('''','''', @geography_ids, @pos) > 0
							BEGIN
								SET @len = CHARINDEX('''','''', @geography_ids, @pos)
								SET @strCurId = SUBSTRING(@geography_ids, @pos, @len - @pos)
								SET @nCurId = CAST(@strCurId AS INT)
								INSERT INTO [dbo].[UserGeographies] VALUES(@userID, @nCurId)
								set @pos = @len + 1
							END
							SET @strCurId = SUBSTRING(@geography_ids, @pos, LEN(@geography_ids) - @pos + 1)
							SET @nCurId = CAST(@strCurId AS INT)
							INSERT INTO [dbo].[UserGeographies] VALUES(@userID, @nCurId)

							SELECT @userID AS NewUserID'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetAllUsersInfo
							@orgID INT,
							@orgName NVARCHAR(200)
						AS
						-- Create a Table Variable to store the compiled user data  for the company.
						DECLARE @CompiledUsers TABLE
						(
							[organization_id] INT NOT NULL,
							[organization_name] NVARCHAR(200) NOT NULL,
							[first_name] NVARCHAR(35) NOT NULL,
							[middle_initial] NVARCHAR(2) NOT NULL,
							[last_name] NVARCHAR(35) NOT NULL,
							[email] NVARCHAR(50) NOT NULL,
							[phone] VARCHAR(50) NOT NULL,
							[title_id] INT NOT NULL,
							[other_title] NVARCHAR(150),
							[access_level_id] INT NOT NULL,
							[user_commodity_ids] NVARCHAR(100) NULL,
							[user_geography_ids] NVARCHAR(100) NULL,
							[email_subscription] BIT NOT NULL,
							[viirs_email_frequency] INT NOT NULL,
							[glad_email_frequency] INT NOT NULL,
							[forma_email_frequency] INT NOT NULL,
							[terrai_email_frequency] INT NOT NULL,
							[gran_chaco_email_frequency] INT NOT NULL,
							[auth_preference_id] INT NOT NULL,
							[user_status_id] INT NOT NULL,
							[activated_time] SMALLDATETIME NULL,
							[user_id] INT NULL
						)

						-- Setup a new cursor to go through each user.
						DECLARE @userID INT
						DECLARE user_cursor CURSOR FOR
						SELECT id FROM Users WHERE is_system_user = 0

						-- Loop through each user and create compiled data.
						OPEN user_cursor
						FETCH NEXT FROM user_cursor
						INTO @userID
						WHILE  @@FETCH_STATUS = 0
						BEGIN
							-- Obtain User Information.
							DECLARE @first_name NVARCHAR(35)
							DECLARE @middle_initial NVARCHAR(2)
							DECLARE @last_name NVARCHAR(35)
							DECLARE @email NVARCHAR(50)
							DECLARE @phone VARCHAR(50)
							DECLARE @email_subscription INT
							DECLARE @viirsEmailFrequency INT
							DECLARE @gladEmailFrequency INT
							DECLARE @formaEmailFrequency INT
							DECLARE @terraiEmailFrequency INT
							DECLARE @granChacoEmailFrequency INT
							DECLARE @auth_preference_id INT
							DECLARE @title_id INT
							DECLARE @other_title NVARCHAR(150)
							DECLARE @access_level_id INT
							DECLARE @access_level VARCHAR(30)
							DECLARE @status_id INT
							DECLARE @status_level VARCHAR(30)
							DECLARE @activated_time SMALLDATETIME
							SELECT @first_name = first_name, @middle_initial = middle_initial,
							@last_name = last_name, @email = email, @phone = phone, @title_id = title_id, @other_title = other_title,
							@access_level_id = access_level_id, @status_id = status_id,
							@email_subscription = email_subscription, @activated_time = activated_time,
							@viirsEmailFrequency = viirs_email_frequency, @gladEmailFrequency = glad_email_frequency,
							@formaEmailFrequency = forma_email_frequency, @terraiEmailFrequency = terrai_email_frequency,
							@granChacoEmailFrequency = gran_chaco_email_frequency
							FROM Users WHERE id = @userID

							-- Obtain User Commodities Info.
							DECLARE @arrCommodities NVARCHAR(100)
							SELECT @arrCommodities = COALESCE(@arrCommodities + '''','''', '''''''') + CONVERT(varchar(3), commodity_id)
							FROM UserCommodities WHERE [user_id] = @userID

							-- Obtain User Geographies Info.
							DECLARE @arrGeographies NVARCHAR(100)
							SELECT @arrGeographies = COALESCE(@arrGeographies + '''','''', '''''''') + CONVERT(varchar(3), geography_id)
							FROM UserGeographies WHERE [user_id] = @userID

							-- Set Auth Preference to Email.
							SET @auth_preference_id = 0

							-- Insert Row with data into compiled table.
							INSERT INTO @CompiledUsers
							VALUES(@orgID, @orgName, @first_name, @middle_initial, @last_name, @email, @phone, @title_id, @other_title, @access_level_id,
								@arrCommodities, @arrGeographies, @email_subscription, @viirsEmailFrequency,
								@gladEmailFrequency, @formaEmailFrequency, @terraiEmailFrequency, @granChacoEmailFrequency,
								@auth_preference_id, @status_id, @activated_time, @userID)

							-- Fetch Next Row.
							FETCH NEXT FROM user_cursor
							INTO @userID

							--Reset arrays for next pass.
							SET @arrCommodities = NULL
							SET @arrGeographies = NULL
						END
						CLOSE user_cursor
						DEALLOCATE user_cursor

						SELECT * FROM @CompiledUsers'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL


		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetUserInfoCommodities
							@userID INT
						AS
							SELECT commodity_id FROM UserCommodities WHERE user_id = @userID'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetUserInfoGeographies
							@userID INT
						AS
							SELECT geography_id FROM UserGeographies WHERE user_id = @userID'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
		  USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspCreateList
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
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspAddListToAnalyses
					@list_id INT
				AS
					-- Insert list_id into Analyses Table
					INSERT INTO Analyses (list_id) VALUES (@list_id)
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspRerunList
					@list_id INT,
					@list_analysis_table_name NVARCHAR(150),
					@associated_gfwlist TINYINT
				AS
					DECLARE @status_id INT

					-- Set the status_id to processing
					SET @status_id = 1

					-- Update the status_id to processing for that list_id
					EXEC uspResetListStatus @list_id, @status_id, @associated_gfwlist

					-- Drop the analyses list table
					EXEC uspDropOrganizationTable @list_analysis_table_name

					-- Create the list analysis table
					EXEC uspCreateAnalysisTable @list_analysis_table_name

					-- Insert new rows (equal to the number of locations) in the list analysis table
					EXEC uspInsertNewLocationToAnalysisTable @list_id
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
		  USE [{DATABASENAME}]
			EXEC(''
		    CREATE PROCEDURE uspCreateListTable
				  @table_name NVARCHAR(150),
				  @query_string NVARCHAR(MAX)
				AS
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)

					SET @TEMPLATE = ''''CREATE TABLE [{TABLE_NAME}] ({QUERY_STRING}, INDEX [IX_{TABLE_NAME}] NONCLUSTERED(location_id))''''

					SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', @table_name)
					SET @SQL = REPLACE(@SQL, ''''{QUERY_STRING}'''', @query_string)
					EXEC sp_executesql @SQL
		  '')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE uspResetListStatus
					@list_id INT,
					@status_id INT,
					@associated_gfwlist TINYINT
				AS
					UPDATE Lists SET list_status_id = @status_id, associated_gfwlist = @associated_gfwlist WHERE id = @list_id
					UPDATE Analyses SET status_id = @status_id, analysis_success_count = 0, analysis_fail_count = 0 WHERE list_id = @list_id
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE uspSetListStatus
					@list_id INT,
					@status_id INT
				AS
					UPDATE Lists SET list_status_id = @status_id WHERE id = @list_id
					UPDATE Analyses SET status_id = @status_id, analysis_success_count = 0, analysis_fail_count = 0 WHERE list_id = @list_id
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		-- Dry_run is used to run the store procedure without the need to update the database with the new list status_id.
		-- We only want to update the list status_id once the dynamodb process has completed.
		SET @TEMPLATE = '
		  USE [{DATABASENAME}]
			EXEC(''
		    CREATE PROCEDURE uspUpdateListStatus
				@list_table NVARCHAR(150),
				@analysis_table NVARCHAR(150),
				@dry_run BIT
			AS
				DECLARE @TEMPLATE NVARCHAR(MAX)
				DECLARE @SQL NVARCHAR(MAX)

				SET @TEMPLATE = ''''
					DECLARE @list_id INT
        	DECLARE @listStatus INT
					DECLARE @pendingLocations INT
					DECLARE @listAnalysisStatus INT

					-- Set List Status to still processing (Default)
					SET @listStatus = 1

					-- Obtain the list id from the list table name.
					SELECT @list_id = id FROM Lists WHERE list_table_name = ''''''''{LIST_TABLE}''''''''

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
					''''
					SET @SQL = REPLACE(@TEMPLATE, ''''{ANALYSIS_TABLE}'''', @analysis_table)
					SET @SQL = REPLACE(@SQL, ''''{DRY_RUN}'''', @dry_run)
					SET @SQL = REPLACE(@SQL, ''''{LIST_TABLE}'''', @list_table)
					EXEC sp_executesql @SQL
		  '')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
		  USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE uspCreateAnalysisTable
					@list_analysis_table_name NVARCHAR(150)
				AS
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)

					SET @TEMPLATE = ''''
						CREATE TABLE [{TABLE_NAME}]
						(
							[id] INT IDENTITY(1,1) NOT NULL,
							[location_id] INT NOT NULL,
							[location_status_id] INT NOT NULL,

							[tree_cover_loss_total_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_peat_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_intact_forest_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_protected_areas_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_sea_landcover_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_idn_landcover_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_idn_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_soy_yearly] NVARCHAR(2000) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_idn_legal_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_idn_forest_moratorium_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_prodes_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_prodes_wdpa_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_prodes_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[tree_cover_loss_brazil_biomes_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',

							[tree_cover_extent_total] DECIMAL(18,6) DEFAULT 0.000000,
							[tree_cover_extent_primary_forest] DECIMAL(18,6) DEFAULT 0.000000,
							[tree_cover_extent_protected_areas] DECIMAL(18,6) DEFAULT 0.000000,
							[tree_cover_extent_peat] DECIMAL(18,6) DEFAULT 0.000000,
							[tree_cover_extent_intact_forest] DECIMAL(18, 6) DEFAULT 0.00000,

							[natural_habitat_primary] DECIMAL(18, 6) DEFAULT 0.00000,
							[natural_habitat_intact_forest] DECIMAL(18,6) DEFAULT 0.000000,
							[natural_habitat_global_land_cover] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',

							[total_area] DECIMAL(18, 6) DEFAULT 0.00000,
							[protected_areas_area] DECIMAL(18,6) DEFAULT 0.000000,
							[critical_habitat_alliance_zero] DECIMAL(18,6) DEFAULT 0.000000,
							[indigenous_people_land_rights] DECIMAL(18,6) DEFAULT 0.000000,
							[peat_area] DECIMAL(18,6) DEFAULT 0.000000,
							[fires_counts_monthly] NVARCHAR(MAX) DEFAULT '''''''''''''''',
							[soy_total_area] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[soy_pre2001_nonforest_area] DECIMAL(18, 6)  DEFAULT 0.00000,
							[brazil_biomes] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[idn_legal_area] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[sea_landcover_area] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[idn_landcover_area] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[idn_forest_moratorium_area] DECIMAL(18, 6) DEFAULT 0.00000,

							[south_america_presence] NVARCHAR(50) DEFAULT ''''''''false'''''''',
							[legal_amazon_presence] NVARCHAR(50) DEFAULT ''''''''false'''''''',
							[brazil_biomes_presence] NVARCHAR(50) DEFAULT ''''''''false'''''''',
							[cerrado_biome_presence] NVARCHAR(50) DEFAULT ''''''''false'''''''',
							[southeast_asia_presence] NVARCHAR(50) DEFAULT ''''''''false'''''''',
							[indonesia_presence] NVARCHAR(50) DEFAULT ''''''''false'''''''',

							[commodity_threat_deforestation_level] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_threat_peat_level] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_threat_protected_areas_level] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_threat_fires_level] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_threat_overall_level] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_threat_overall_score] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_value_forest_extent_level] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_value_peat_level] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_value_protected_areas_level] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_value_overall_level] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_value_overall_score] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',

							[commodity_value_forest_extent] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_value_peat] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_value_protected_areas] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',

							[commodity_mill_priority_level] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_mill_priority_score] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',

							[commodity_threat_deforestation] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_threat_peat] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_threat_protected_areas] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[commodity_threat_fires] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[dissolved_data_location_info] NVARCHAR(300) DEFAULT ''''''''{}'''''''',
							
							[tree_cover_loss_arg_otbn_yearly] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[arg_otbn_area] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[argentina_presence] NVARCHAR(50) DEFAULT ''''''''false'''''''',

							[protected_areas_by_category_area] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',
							[landmark_by_category_area] NVARCHAR(MAX) DEFAULT ''''''''{}'''''''',

							[country_specific_deforestation_yearly] NVARCHAR(MAX),
							[country_specific_deforestation_wdpa_yearly] NVARCHAR(MAX),
							[country_specific_deforestation_landmark_yearly] NVARCHAR(MAX),
							[country_specific_deforestation_classified_region_yearly] NVARCHAR(MAX),
							[tree_cover_loss_by_country_yearly] NVARCHAR(MAX),
							[tree_cover_loss_by_country_wdpa_yearly] NVARCHAR(MAX),
							[tree_cover_loss_by_country_landmark_yearly] NVARCHAR(MAX),

							INDEX [IX_{TABLE_NAME}_1] NONCLUSTERED(location_id),
							INDEX [IX_{TABLE_NAME}_2] NONCLUSTERED(location_status_id)
						)
					''''

					SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', @list_analysis_table_name)
					EXEC sp_executesql @SQL
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspGetUserLists
								@user_id INT
						AS
							SELECT L.*, LL.large_list_id
							FROM Lists L
							LEFT JOIN LargeLists LL ON L.id=LL.list_id
							WHERE user_id = @user_id
							ORDER BY list_name '')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspGetAllLists
						AS
							SELECT  L.*, LL.large_list_id
							FROM Lists L
							LEFT JOIN LargeLists LL ON L.id=LL.list_id
							ORDER BY list_name '')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL


		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspAddPolicy
							@document_name NVARCHAR(250)
						AS
							IF NOT EXISTS ( SELECT * FROM Policies
															WHERE document_name = @document_name)
							INSERT INTO Policies
							VALUES (@document_name)'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE dbo.uspGetAccountClassifications
			AS SELECT * FROM AccountClassifications'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE dbo.uspGetAccountInformation
			AS SELECT * FROM AccountProfile LEFT JOIN Users on Users.id = AccountProfile.manager_user_id'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspGetPolicyList
							@orgID INT = 0
							AS
								IF (@orgID > 0)
									BEGIN
										SELECT @orgID AS organization_id, document_name
										FROM AccountProfile
										CROSS JOIN Policies
									END
								ELSE
									BEGIN
										SELECT document_name
										FROM Policies
									END'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE dbo.uspDeletePolicy(
							@document_name NVARCHAR(250)
						)
						AS
							DELETE FROM Policies
							WHERE document_name=@document_name'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE [dbo].[uspCopyLocations]
						@list_id INT,
						@location_ids NVARCHAR(400)
					AS
						DECLARE @TEMPLATE NVARCHAR(MAX)
						DECLARE @SQL NVARCHAR(MAX)
						DECLARE @sourceTable NVARCHAR(MAX)

						SELECT @sourceTable = list_table_name FROM dbo.Lists where id = @list_id

						SET @TEMPLATE = ''''
							SELECT *, Geometry.ToString() as WKTGeometry INTO #TempTable FROM [{LIST_TABLE}]
							WHERE location_id IN({LISTIDS})
							ALTER TABLE #TempTable
							DROP COLUMN location_id
							SELECT * FROM #TempTable
							DROP TABLE #TempTable
						''''
						SET @SQL = REPLACE(@TEMPLATE, ''''{LIST_TABLE}'''', @sourceTable)
						SET @SQL = REPLACE(@SQL, ''''{LISTIDS}'''', @location_ids)
						EXEC(@SQL)'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		/*
			STORED PROCEDURES FOR LISTS
		*/
		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspUpdateListStringResult
					@list_id INT,
					@column_name NVARCHAR(50),
					@value VARCHAR(MAX)
				AS
					BEGIN

					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)
					
					IF @column_name IN (''''vector_tiles_storage_path'''', ''''error_file_storage_path'''')

						BEGIN
						-- Update Column with Value
						SET @TEMPLATE = ''''
							BEGIN TRANSACTION
								UPDATE dbo.[Lists]
								SET {COLUMN_NAME} = ''''''''{VALUE}''''''''
								WHERE id = {LIST_ID}
							COMMIT TRANSACTION
						''''

						SET @SQL = REPLACE(@TEMPLATE, ''''{COLUMN_NAME}'''', @column_name)
						SET @SQL = REPLACE(@SQL, ''''{VALUE}'''', @value)
						SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @list_id)
						EXEC sp_executesql @SQL

						END
					ELSE
						RAISERROR (''''Invalid Column Name.'''', 1, 1);

					END

			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		/*
			STORED PROCEDURES FOR ANALYSIS
		*/
		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspUpdateListAnalysisSuccessCount
					@list_name NVARCHAR(150)
				AS
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)
					DECLARE @listID INT

					--Get List ID for the list.
					SELECT @listID = id FROM Lists WHERE list_name = @list_name

					IF @listID IS NOT NULL
					BEGIN
						-- Update Success Count.
						SET @TEMPLATE = ''''
							BEGIN TRANSACTION
								UPDATE [Analyses]
								SET analysis_success_count = analysis_success_count + 1
								WHERE list_id = {LIST_ID}
							COMMIT TRANSACTION
						''''

						SET @SQL = REPLACE(@TEMPLATE, ''''{LIST_ID}'''', @listID)
						EXEC sp_executesql @SQL

						-- Return both success and fail counts.
						SET @TEMPLATE = ''''
							BEGIN TRANSACTION
								SELECT analysis_success_count, analysis_fail_count
								FROM [Analyses]
								WHERE list_id = {LIST_ID}
							COMMIT TRANSACTION
						''''

						SET @SQL = REPLACE(@TEMPLATE, ''''{LIST_ID}'''', @listID)
						EXEC sp_executesql @SQL
					END
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspUpdateListAnalysisFailCount
					@list_name NVARCHAR(150)
				AS
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)
					DECLARE @listID INT

					--Get List ID for the list.
					SELECT @listID = id FROM Lists WHERE list_name = @list_name

					IF @listID IS NOT NULL
					BEGIN
						-- Update Success Count.
						SET @TEMPLATE = ''''
							BEGIN TRANSACTION
								UPDATE [Analyses]
								SET analysis_fail_count = analysis_fail_count + 1
								WHERE list_id = {LIST_ID}
							COMMIT TRANSACTION
						''''

						SET @SQL = REPLACE(@TEMPLATE, ''''{LIST_ID}'''', @listID)
						EXEC sp_executesql @SQL

						-- Return both success and fail counts.
						SET @TEMPLATE = ''''
							BEGIN TRANSACTION
								SELECT analysis_success_count, analysis_fail_count
								FROM [Analyses]
								WHERE list_id = {LIST_ID}
							COMMIT TRANSACTION
						''''

						SET @SQL = REPLACE(@TEMPLATE, ''''{LIST_ID}'''', @listID)
						EXEC sp_executesql @SQL
					END
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspUpdateListAnalysisStatus
					@list_name NVARCHAR(150),
					@status_id INT
				AS
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)
					DECLARE @listID INT

					--Get List ID for the list.
					SELECT @listID = id FROM Lists WHERE list_name = @list_name

					SET @TEMPLATE = ''''
						BEGIN TRANSACTION
							UPDATE [Analyses]
							SET status_id = {STATUS_ID}
							WHERE list_id = {LIST_ID}
						COMMIT TRANSACTION
					''''

					SET @SQL = REPLACE(@TEMPLATE, ''''{STATUS_ID}'''', @status_id)
					SET @SQL = REPLACE(@SQL, ''''{list_id}'''', @listID)
					EXEC sp_executesql @SQL
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspUpdateLocationAnalysisStatus
					@analysis_table_name NVARCHAR(150),
					@location_id INT,
					@location_status_id INT
				AS
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)

					SET @TEMPLATE = ''''
						BEGIN TRANSACTION
							UPDATE [{ANALYSIS_TABLE}]
							SET location_status_id = {LOCATION_STATUS_ID}
							WHERE location_id = {LOCATION_ID}
						COMMIT TRANSACTION
					''''

					SET @SQL = REPLACE(@TEMPLATE, ''''{ANALYSIS_TABLE}'''', @analysis_table_name)
					SET @SQL = REPLACE(@SQL, ''''{LOCATION_STATUS_ID}'''', @location_status_id)
					SET @SQL = REPLACE(@SQL, ''''{LOCATION_ID}'''', @location_id)
					EXEC sp_executesql @SQL
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspUpdateLocationAnalysisNumberResult
					@analysis_table_name NVARCHAR(150),
					@location_id INT,
					@column_name NVARCHAR(50),
					@value DECIMAL(18,6)
				AS
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)

					SET @TEMPLATE = ''''
						BEGIN TRANSACTION
							UPDATE [{ANALYSIS_TABLE}]
							SET {COLUMN_NAME} = {VALUE}
							WHERE location_id = {LOCATION_ID}
						COMMIT TRANSACTION
					''''

					SET @SQL = REPLACE(@TEMPLATE, ''''{ANALYSIS_TABLE}'''', @analysis_table_name)
					SET @SQL = REPLACE(@SQL, ''''{COLUMN_NAME}'''', @column_name)
					SET @SQL = REPLACE(@SQL, ''''{VALUE}'''', @value)
					SET @SQL = REPLACE(@SQL, ''''{LOCATION_ID}'''', @location_id)
					EXEC sp_executesql @SQL
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspUpdateLocationAnalysisStringResult
					@analysis_table_name NVARCHAR(150),
					@location_id INT,
					@column_name NVARCHAR(50),
					@value VARCHAR(MAX)
				AS
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)

					SET @TEMPLATE = ''''
						BEGIN TRANSACTION
							UPDATE [{ANALYSIS_TABLE}]
							SET {COLUMN_NAME} = ''''''''{VALUE}''''''''
							WHERE location_id = {LOCATION_ID}
						COMMIT TRANSACTION
					''''

					SET @SQL = REPLACE(@TEMPLATE, ''''{ANALYSIS_TABLE}'''', @analysis_table_name)
					SET @SQL = REPLACE(@SQL, ''''{COLUMN_NAME}'''', @column_name)
					SET @SQL = REPLACE(@SQL, ''''{VALUE}'''', @value)
					SET @SQL = REPLACE(@SQL, ''''{LOCATION_ID}'''', @location_id)
					EXEC sp_executesql @SQL
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspUpdateListAnalysisNumberResult
					@list_name NVARCHAR(150),
					@column_name NVARCHAR(50),
					@value DECIMAL(18,6)
				AS
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)
					DECLARE @listID INT

					--Get List ID for the list.
					SELECT @listID = id FROM Lists WHERE list_name = @list_name

					SET @TEMPLATE = ''''
						BEGIN TRANSACTION
							UPDATE Analyses
							SET {COLUMN_NAME} = {VALUE}
							WHERE list_id = {LIST_ID}
						COMMIT TRANSACTION
					''''

					SET @SQL = REPLACE(@TEMPLATE, ''''{COLUMN_NAME}'''', @column_name)
					SET @SQL = REPLACE(@SQL, ''''{VALUE}'''', @value)
					SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listID)
					EXEC sp_executesql @SQL
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspUpdateListAnalysisStringResult
					@list_name NVARCHAR(150),
					@column_name NVARCHAR(50),
					@value VARCHAR(MAX)
				AS
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)
					DECLARE @listID INT

					--Get List ID for the list.
					SELECT @listID = id FROM Lists WHERE list_name = @list_name

					SET @TEMPLATE = ''''
						BEGIN TRANSACTION
							UPDATE [Analyses]
							SET {COLUMN_NAME} = ''''''''{VALUE}''''''''
							WHERE list_id = {LIST_ID}
						COMMIT TRANSACTION
					''''

					SET @SQL = REPLACE(@TEMPLATE, ''''{COLUMN_NAME}'''', @column_name)
					SET @SQL = REPLACE(@SQL, ''''{VALUE}'''', @value)
					SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listID)
					EXEC sp_executesql @SQL
			'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspEditLocation
					@list_id INT,
					@location_id INT,
					@statement NVARCHAR(MAX)
				AS
					DECLARE @LIST_TABLE NVARCHAR(150)
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)

					SET @LIST_TABLE = (
						SELECT list_table_name
						FROM Lists
						WHERE id = @list_id
					)

					SET @TEMPLATE = ''''
						UPDATE [{TABLE}]
						SET {STATEMENT}
						WHERE location_id = {LOCATION_ID}
					''''

					SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE}'''', @LIST_TABLE)
					SET @SQL = REPLACE(@SQL, ''''{STATEMENT}'''', @statement)
					SET @SQL = REPLACE(@SQL, ''''{LOCATION_ID}'''', @location_id)
					EXEC sp_executesql @SQL
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE [dbo].[uspDeleteLocation]
							@list_id INT,
							@location_id INT
						AS
							DECLARE @TEMPLATE NVARCHAR(MAX)
							DECLARE @SQL NVARCHAR(MAX)
							DECLARE @list_table_name NVARCHAR(150)
							DECLARE @analysis_table_name NVARCHAR(150)

							SELECT @list_table_name = list_table_name FROM dbo.Lists WHERE id = @list_id
							SELECT @analysis_table_name = list_analysis_table_name FROM dbo.Lists WHERE id = @list_id

							SET @TEMPLATE = ''''DELETE FROM [{TABLE_NAME}] WHERE location_id = {LOCATION_ID}''''
							SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', @list_table_name)
							SET @SQL = REPLACE(@SQL, ''''{LOCATION_ID}'''', @location_id)
							EXEC sp_executesql @SQL

							SET @TEMPLATE = ''''DELETE FROM [{TABLE_NAME}] WHERE location_id = {LOCATION_ID}''''
							SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', @analysis_table_name)
							SET @SQL = REPLACE(@SQL, ''''{LOCATION_ID}'''', @location_id)
							EXEC sp_executesql @SQL
		
							SET @TEMPLATE = ''''DELETE FROM [{TABLE_NAME}] WHERE list_id = {LIST_ID}
											AND (location_id = -1 OR location_id = {LOCATION_ID})''''
							SET @SQL = REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', ''''Analyses-Dashboard'''')
							SET @SQL = REPLACE(@SQL, ''''{LOCATION_ID}'''', @location_id)
							SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @list_id)
							EXEC sp_executesql @SQL
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspCopyLocationAnalysis
					@dest_list_id INT,
					@dest_location_id INT,
					@src_list_id INT,
					@src_location_id INT,
					@statement NVARCHAR(MAX)
				AS
					DECLARE @SRC_TABLE NVARCHAR(150)
					DECLARE @DEST_TABLE NVARCHAR(150)
					DECLARE @SQL NVARCHAR(MAX)

					SET @SRC_TABLE = (SELECT list_analysis_table_name FROM Lists WHERE id = @src_list_id)
					SET @DEST_TABLE = (SELECT list_analysis_table_name FROM Lists WHERE id = @dest_list_id)

					SET @SQL = ''''
						UPDATE [{DEST_TABLE}]
						SET {STATEMENT}
						FROM [{SRC_TABLE}]
						WHERE [{SRC_TABLE}].location_id = {SRC_LOCATION_ID} AND [{DEST_TABLE}].location_id = {DEST_LOCATION_ID}
					''''

					SET @SQL = REPLACE(@SQL, ''''{DEST_TABLE}'''', @DEST_TABLE)
					SET @SQL = REPLACE(@SQL, ''''{SRC_TABLE}'''', @SRC_TABLE)
					SET @SQL = REPLACE(@SQL, ''''{STATEMENT}'''', @statement)
					SET @SQL = REPLACE(@SQL, ''''{SRC_LOCATION_ID}'''', @src_location_id)
					SET @SQL = REPLACE(@SQL, ''''{DEST_LOCATION_ID}'''', @dest_location_id)
					EXEC sp_executesql @SQL

					SET @SQL = ''''
						UPDATE [{DEST_TABLE}]
						SET location_status_id = 3
						WHERE location_status_id = 1
					''''
					SET @SQL = REPLACE(@SQL, ''''{DEST_TABLE}'''', @DEST_TABLE)
					EXEC sp_executesql @SQL
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = '
			USE [{DATABASENAME}]
			EXEC(''
				CREATE PROCEDURE dbo.uspGetListNameSchema
					@list_id INT
				AS
					SELECT id, user_id, list_name, list_table_name, list_analysis_table_name FROM Lists WHERE id = @list_id
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE dbo.uspGetListLockStatus
					@list_id INT
				AS
					SELECT lock_status, lock_user_id FROM Lists WHERE id = @list_id
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE dbo.uspSetListLocked
					@list_id INT,
					@user_id INT
				AS
					DECLARE @date SMALLDATETIME
					SET @date = getdate()
					UPDATE Lists SET lock_status = @date, lock_user_id = @user_id WHERE id = @list_id
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE dbo.uspSetListUnlocked
					@list_id INT,
					@user_id INT
				AS
					UPDATE Lists SET lock_status = NULL, lock_user_id = @user_id WHERE id = @list_id
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE TABLE [dbo].[Folders] (
					[id] INT IDENTITY(1,1) NOT NULL UNIQUE,
					[name] NVARCHAR(200) NOT NULL,
					[user_id] INT NOT NULL,
					[last_accessed_at] DATETIME NOT NULL,
					[created_at] DATETIME NOT NULL,
					CONSTRAINT [PK_Folders_ID] PRIMARY KEY CLUSTERED(id),
					CONSTRAINT [FK_User_ID] FOREIGN KEY (user_id) REFERENCES [dbo].[Users](id),
					CONSTRAINT [UQ_USERID_FOLDER_NAME] UNIQUE (user_id, name)
				);
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE TABLE [dbo].[FolderItems] (
					[list_id] INT NOT NULL,
					[folder_id] INT NOT NULL,
					CONSTRAINT [FK_List_ID] FOREIGN KEY (list_id) REFERENCES [dbo].[Lists](id),
					CONSTRAINT [FK_Folder_ID] FOREIGN KEY (folder_id) REFERENCES [dbo].[Folders](id) ON DELETE CASCADE ON UPDATE CASCADE,
					CONSTRAINT [UQ_Folders_Lists] UNIQUE NONCLUSTERED ([list_id], [folder_id])
				);
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE OR ALTER PROCEDURE [dbo].[uspMoveListToFolder]
				@from_folder_id INT,
				@to_folder_id INT,
				@list_ids NVARCHAR(MAX),
				@user_id INT
			AS
			BEGIN
				DECLARE @SQL NVARCHAR(1000)
				DECLARE @DELIMITER CHAR(1)

				SET @DELIMITER = '''',''''

				EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
												@folder_id = @to_folder_id

				EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
												@folder_id = @from_folder_id

				SET @SQL = ''''UPDATE [dbo].[FolderItems] SET folder_id = {TO_FOLDER_ID} WHERE list_id IN (SELECT VALUE FROM STRING_SPLIT(''''''''{LIST_IDS}'''''''', ''''''''{DELIMITER}''''''''))
							AND folder_id = (SELECT id FROM [dbo].[Folders] WHERE id = {FROM_FOLDER_ID} AND user_id = {USER_ID})''''
				SET @SQL = REPLACE(@SQL, ''''{FROM_FOLDER_ID}'''', @from_folder_id)
				SET @SQL = REPLACE(@SQL, ''''{TO_FOLDER_ID}'''', @to_folder_id)
				SET @SQL = REPLACE(@SQL, ''''{LIST_IDS}'''', @list_ids)
				SET @SQL = REPLACE(@SQL, ''''{DELIMITER}'''', @DELIMITER)
				SET @SQL = REPLACE(@SQL, ''''{USER_ID}'''', @user_id)
				EXEC sp_executesql @SQL

				SELECT @@ROWCOUNT AS affected_rows
			END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE OR ALTER PROCEDURE [dbo].[uspDoesFolderExist]
				@user_id INT,
				@folder_id INT
			AS
			BEGIN
				DECLARE @SQL NVARCHAR(1000)
				DECLARE @rowcount INT 

				SET @SQL = ''''SELECT @rowcount=COUNT(*) FROM [dbo].[Folders] WHERE id = {FOLDER_ID} AND user_id = {USER_ID}''''
				SET @SQL = REPLACE(@SQL, ''''{FOLDER_ID}'''', @folder_id)
				SET @SQL = REPLACE(@SQL, ''''{USER_ID}'''', @user_id)
				EXEC sp_executesql @SQL, N''''@rowcount int output'''', @rowcount output;

				IF @rowcount = 0
				BEGIN
					;THROW 50005, N''''The list does not exists...'''', 1;
				END
			END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE OR ALTER PROCEDURE [dbo].[uspAddListToFolder]
				@folder_id INT,
				@list_ids NVARCHAR(MAX),
				@user_id INT
			AS
			BEGIN
				DECLARE @SQL NVARCHAR(MAX)
				DECLARE @DELIMITER CHAR(1)

				SET @DELIMITER = '''',''''
					
				EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
												@folder_id = @folder_id

				SET @SQL = ''''INSERT INTO [dbo].[FolderItems] (list_id, folder_id) SELECT value, {FOLDER_ID}
							FROM STRING_SPLIT(''''''''{LIST_IDS}'''''''', ''''''''{DELIMITER}'''''''')
							WHERE RTRIM(value) <> '''''''''''''''';
							''''

				SET @SQL = REPLACE(@SQL, ''''{FOLDER_ID}'''', @folder_id)
				SET @SQL = REPLACE(@SQL, ''''{LIST_IDS}'''', @list_ids)
				SET @SQL = REPLACE(@SQL, ''''{DELIMITER}'''', @DELIMITER)
				EXEC sp_executesql @SQL

				SELECT @@ROWCOUNT AS affected_rows
			END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE [dbo].[uspCreateNewFolder]
				@name NVARCHAR(200),
				@user_id INT
			AS
				BEGIN
					DECLARE @SQL NVARCHAR(1000)

					SET @SQL = ''''INSERT INTO [dbo].[Folders] (name, user_id, last_accessed_at, created_at) VALUES (''''''''{NAME}'''''''', {USER_ID}, GETUTCDATE(), GETUTCDATE());
								SELECT id FROM Folders WHERE name = ''''''''{NAME}'''''''' AND user_id = {USER_ID}''''
					SET @SQL = REPLACE(@SQL, N''''{NAME}'''', @name)
					SET @SQL = REPLACE(@SQL, ''''{USER_ID}'''', @user_id)
					EXEC sp_executesql @SQL
				END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE OR ALTER PROCEDURE [dbo].[uspRemoveListsFromFolder]
				@folder_id INT,
				@list_ids NVARCHAR(MAX),
				@user_id INT
			AS
			DECLARE @SQL NVARCHAR(1000)

			BEGIN
				EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
																				@folder_id = @folder_id

				SET @SQL = ''''DELETE [dbo].[FolderItems] FROM [dbo].[FolderItems] INNER JOIN [dbo].[Folders] F ON F.id = folder_id
												WHERE list_id IN ({LIST_ID}) AND folder_id = {FOLDER_ID} AND F.user_id = {USER_ID}''''
				SET @SQL = REPLACE(@SQL, ''''{FOLDER_ID}'''', @folder_id)
				SET @SQL = REPLACE(@SQL, ''''{USER_ID}'''', @user_id)
				SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @list_ids)
				EXEC sp_executesql @SQL

				SELECT @@ROWCOUNT AS affected_rows
			END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE OR ALTER PROCEDURE [dbo].[uspRenameFolder]
				@folder_id INT,
				@folder_name NVARCHAR(200),
				@user_id INT
			AS
			DECLARE @SQL NVARCHAR(1000)
			BEGIN
				EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
												@folder_id = @folder_id

				SET @SQL = ''''UPDATE [dbo].[Folders] SET name = ''''''''{FOLDER_NAME}'''''''' WHERE id = {FOLDER_ID} AND user_id = {USER_ID}''''
				SET @SQL = REPLACE(@SQL, ''''{FOLDER_ID}'''', @folder_id)
				SET @SQL = REPLACE(@SQL, N''''{FOLDER_NAME}'''', @folder_name)
				SET @SQL = REPLACE(@SQL, ''''{USER_ID}'''', @user_id)
				EXEC sp_executesql @SQL
			END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE OR ALTER PROCEDURE [dbo].[uspGetFolders]
				@user_id INT
			AS
			DECLARE @SQL NVARCHAR(1000)
			BEGIN
				SET @SQL = ''''SELECT id, name, last_accessed_at, created_at FROM [dbo].[Folders] WHERE user_id = {USER_ID}''''
				SET @SQL = REPLACE(@SQL, ''''{USER_ID}'''', @user_id)
				EXEC sp_executesql @SQL
			END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE OR ALTER PROCEDURE [dbo].[uspUpdateFolderAccessTime]
				@folder_id INT,
				@user_id INT
			AS
			DECLARE @SQL NVARCHAR(1000)

			BEGIN
				EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
												@folder_id = @folder_id

				SET @SQL = ''''UPDATE [dbo].[Folders] SET last_accessed_at = GETUTCDATE() WHERE id = {FOLDER_ID} AND user_id = {USER_ID}''''
				SET @SQL = REPLACE(@SQL, ''''{FOLDER_ID}'''', @folder_id)
				SET @SQL = REPLACE(@SQL, ''''{USER_ID}'''', @user_id)
				EXEC sp_executesql @SQL
			END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE OR ALTER PROCEDURE [dbo].[uspGetFolder]
				@folder_id INT,
				@user_id INT
			AS
			DECLARE @SQL NVARCHAR(1000)

			BEGIN
				EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
												@folder_id = @folder_id

				SET @SQL = ''''SELECT id, name, last_accessed_at as last_access_time, created_at as creation_time, null as lists FROM [dbo].[Folders]
												WHERE id = {FOLDER_ID} AND user_id = {USER_ID}''''
				SET @SQL = REPLACE(@SQL, ''''{FOLDER_ID}'''', @folder_id)
				SET @SQL = REPLACE(@SQL, ''''{USER_ID}'''', @user_id)
				EXEC sp_executesql @SQL
			END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE OR ALTER PROCEDURE [dbo].[uspGetFolderItems]
				@folder_id INT,
				@user_id INT
			AS
			DECLARE @SQL NVARCHAR(1000)
			BEGIN
				EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
												@folder_id = @folder_id

				SET @SQL = ''''SELECT DISTINCT list_id FROM [dbo].[FolderItems] WHERE folder_id = (SELECT id FROM [dbo].[Folders]
												WHERE id IN ({FOLDER_ID}) AND user_id = {USER_ID})''''
				SET @SQL = REPLACE(@SQL, ''''{FOLDER_ID}'''', @folder_id)
				SET @SQL = REPLACE(@SQL, ''''{USER_ID}'''', @user_id)
				EXEC sp_executesql @SQL
			END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE OR ALTER PROCEDURE [dbo].[uspDeleteFolder]
				@folder_id INT,
				@user_id INT
			AS
			DECLARE @SQL NVARCHAR(1000)
			BEGIN
				EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
												@folder_id = @folder_id

				SET @SQL = ''''DELETE FROM [dbo].[Folders] WHERE id = {FOLDER_ID} AND user_id = {USER_ID};''''
				SET @SQL = REPLACE(@SQL, ''''{FOLDER_ID}'''', @folder_id)
				SET @SQL = REPLACE(@SQL, ''''{USER_ID}'''', @user_id)
				EXEC sp_executesql @SQL

				SELECT @@ROWCOUNT AS affected_rows
			END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE OR ALTER PROCEDURE [dbo].[uspGetAllFolderItems]
				@user_id INT
			AS
			DECLARE @SQL NVARCHAR(1000)
			BEGIN
				SET @SQL = ''''SELECT * FROM [dbo].[FolderItems] WHERE folder_id IN (SELECT id FROM [dbo].[Folders] WHERE USER_ID = {USER_ID});''''
				SET @SQL = REPLACE(@SQL, ''''{USER_ID}'''', @user_id)
				EXEC sp_executesql @SQL
			END
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE [dbo].[uspGetFailedLocationNames]
    			@list_table NVARCHAR(150),
    			@analysis_table NVARCHAR(150)
			AS
					DECLARE @TEMPLATE_ID INT
    			DECLARE @SQL NVARCHAR(MAX)

					-- Check whether this is an investment template or not.
					SELECT @TEMPLATE_ID = template_id FROM Lists WHERE list_table_name = @list_table

					-- If the template id is 1 (Investment, get Investment Name)
					IF @TEMPLATE_ID = 1
					BEGIN
						SET @SQL = ''''SELECT [Investment Name] AS Name FROM [{LIST_TABLE}] l INNER JOIN [{ANALYSIS_TABLE}] a ON l.location_id = a.location_id WHERE a.location_status_id = 3''''
					END
					ELSE
					BEGIN
						SET @SQL = ''''SELECT [Location Name] AS Name FROM [{LIST_TABLE}] l INNER JOIN [{ANALYSIS_TABLE}] a ON l.location_id = a.location_id WHERE a.location_status_id = 3''''
					END
    			SET @SQL = REPLACE(@SQL, ''''{LIST_TABLE}'''', @list_table)
    			SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_TABLE}'''', @analysis_table)
    			EXEC sp_executesql @SQL
			'')
		'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
			EXEC(''CREATE PROCEDURE [dbo].[uspImportFromDynamoDB]
					@json NVARCHAR(MAX),
					@analysis_table NVARCHAR(150),
					@append_locations BIT
				AS
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @APPEND_LOCATION_TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)

					SET @json = REPLACE(REPLACE(@json, CHAR(13), ''''''''), CHAR(10), '''''''')

					DROP TABLE IF EXISTS [temp_analysis_table]
					DROP TABLE IF EXISTS [temp_merged_analysis_table]

					SELECT
						[location_id] AS [location_id],
						ISNULL([tree_cover_loss_total_yearly], ''''{}'''') AS [tree_cover_loss_total_yearly],
						ISNULL([tree_cover_loss_primary_forest_yearly], ''''{}'''') AS [tree_cover_loss_primary_forest_yearly],
						ISNULL([tree_cover_loss_peat_yearly], ''''{}'''') AS [tree_cover_loss_peat_yearly],
						ISNULL([tree_cover_loss_intact_forest_yearly], ''''{}'''') AS [tree_cover_loss_intact_forest_yearly],
						ISNULL([tree_cover_loss_protected_areas_yearly], ''''{}'''') AS [tree_cover_loss_protected_areas_yearly],
						ISNULL([tree_cover_loss_sea_landcover_yearly], ''''{}'''') AS [tree_cover_loss_sea_landcover_yearly],
						ISNULL([tree_cover_loss_idn_landcover_yearly], ''''{}'''') AS [tree_cover_loss_idn_landcover_yearly],
						ISNULL([tree_cover_loss_idn_primary_forest_yearly], ''''{}'''') AS [tree_cover_loss_idn_primary_forest_yearly],
						ISNULL([tree_cover_loss_soy_yearly], ''''{}'''') [tree_cover_loss_soy_yearly],
						ISNULL([tree_cover_loss_idn_legal_yearly], ''''{}'''') AS [tree_cover_loss_idn_legal_yearly],
						ISNULL([tree_cover_loss_idn_forest_moratorium_yearly], ''''{}'''') AS [tree_cover_loss_idn_forest_moratorium_yearly],
						ISNULL([tree_cover_loss_prodes_yearly], ''''{}'''') AS [tree_cover_loss_prodes_yearly],
						ISNULL([tree_cover_loss_prodes_wdpa_yearly], ''''{}'''') AS [tree_cover_loss_prodes_wdpa_yearly],
						ISNULL([tree_cover_loss_prodes_primary_forest_yearly], ''''{}'''') AS [tree_cover_loss_prodes_primary_forest_yearly],
						ISNULL([tree_cover_loss_brazil_biomes_yearly], ''''{}'''') AS [tree_cover_loss_brazil_biomes_yearly],
						ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_total] AS FLOAT)), 0.000000) AS [tree_cover_extent_total],
						ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_primary_forest] AS FLOAT)), 0.000000) AS [tree_cover_extent_primary_forest],
						ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_protected_areas] AS FLOAT)), 0.000000) AS [tree_cover_extent_protected_areas],
						ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_peat] AS FLOAT)), 0.000000) AS [tree_cover_extent_peat],
						ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_intact_forest] AS FLOAT)), 0.000000) AS [tree_cover_extent_intact_forest],
						ISNULL(CONVERT(decimal(18,6), CAST([natural_habitat_primary] AS FLOAT)), 0.000000) AS [natural_habitat_primary],
						ISNULL(CONVERT(decimal(18,6), CAST([natural_habitat_intact_forest] AS FLOAT)), 0.000000) AS [natural_habitat_intact_forest],
						ISNULL([natural_habitat_global_land_cover], ''''{}'''') AS [natural_habitat_global_land_cover],
						ISNULL(CONVERT(decimal(18,6), CAST([total_area] AS FLOAT)), 0.000000) AS [total_area],
						ISNULL(CONVERT(decimal(18,6), CAST([protected_areas_area] AS FLOAT)), 0.000000) AS [protected_areas_area],
						ISNULL(CONVERT(decimal(18,6), CAST([critical_habitat_alliance_zero] AS FLOAT)), 0.000000) AS [critical_habitat_alliance_zero],
						ISNULL(CONVERT(decimal(18,6), CAST([indigenous_people_land_rights] AS FLOAT)), 0.000000) AS [indigenous_people_land_rights],
						ISNULL(CONVERT(decimal(18,6), CAST([peat_area] AS FLOAT)), 0.000000) AS [peat_area],
						ISNULL([fires_counts_monthly], ''''{}'''') AS [fires_counts_monthly],
						ISNULL([soy_total_area], ''''{}'''') AS [soy_total_area],
						ISNULL(CONVERT(decimal(18,6), CAST([soy_pre2001_nonforest_area] AS FLOAT)), 0.000000) AS [soy_pre2001_nonforest_area],
						ISNULL([brazil_biomes], ''''{}'''') AS [brazil_biomes],
						ISNULL([idn_legal_area], ''''{}'''') AS [idn_legal_area],
						ISNULL([sea_landcover_area], ''''{}'''') AS [sea_landcover_area],
						ISNULL([idn_landcover_area], ''''{}'''') AS [idn_landcover_area],
						ISNULL(CONVERT(decimal(18,6), CAST([idn_forest_moratorium_area] AS FLOAT)), 0.000000) AS [idn_forest_moratorium_area],
						ISNULL([south_america_presence], ''''false'''') AS [south_america_presence],
						ISNULL([legal_amazon_presence], ''''false'''') AS [legal_amazon_presence],
						ISNULL([brazil_biomes_presence], ''''false'''') AS [brazil_biomes_presence],
						ISNULL([cerrado_biome_presence], ''''false'''') AS [cerrado_biome_presence],
						ISNULL([southeast_asia_presence], ''''false'''') AS [southeast_asia_presence],
						ISNULL([indonesia_presence], ''''false'''') AS [indonesia_presence],
						ISNULL([commodity_threat_deforestation_level], ''''{}'''') AS [commodity_threat_deforestation_level],
						ISNULL([commodity_threat_peat_level], ''''{}'''') AS [commodity_threat_peat_level],
						ISNULL([commodity_threat_protected_areas_level], ''''{}'''') AS [commodity_threat_protected_areas_level],
						ISNULL([commodity_threat_fires_level], ''''{}'''') AS [commodity_threat_fires_level],
						ISNULL([commodity_threat_overall_level], ''''{}'''') AS [commodity_threat_overall_level],
						ISNULL([commodity_threat_overall_score], ''''{}'''') AS [commodity_threat_overall_score],
						ISNULL([commodity_value_forest_extent_level], ''''{}'''') AS [commodity_value_forest_extent_level],
						ISNULL([commodity_value_peat_level], ''''{}'''') AS [commodity_value_peat_level],
						ISNULL([commodity_value_protected_areas_level], ''''{}'''') AS [commodity_value_protected_areas_level],
						ISNULL([commodity_value_overall_level], ''''{}'''') AS [commodity_value_overall_level],
						ISNULL([commodity_value_overall_score], ''''{}'''') AS [commodity_value_overall_score],
						ISNULL([commodity_value_forest_extent], ''''{}'''') AS [commodity_value_forest_extent],
						ISNULL([commodity_value_peat], ''''{}'''') AS [commodity_value_peat],
						ISNULL([commodity_value_protected_areas], ''''{}'''') AS [commodity_value_protected_areas],
						ISNULL([commodity_mill_priority_level], ''''{}'''') AS [commodity_mill_priority_level],
						ISNULL([commodity_mill_priority_score], ''''{}'''') AS [commodity_mill_priority_score],
						ISNULL([commodity_threat_deforestation], ''''{}'''') AS [commodity_threat_deforestation],
						ISNULL([commodity_threat_peat], ''''{}'''') AS [commodity_threat_peat],
						ISNULL([commodity_threat_protected_areas], ''''{}'''') AS [commodity_threat_protected_areas],
						ISNULL([commodity_threat_fires], ''''{}'''') AS [commodity_threat_fires],
						ISNULL([dissolved_geom_object_key], ''''{}'''') AS [dissolved_geom_object_key],
                        ISNULL([tree_cover_loss_arg_otbn_yearly], ''''{}'''') AS [tree_cover_loss_arg_otbn_yearly],
                        ISNULL([arg_otbn_area], ''''{}'''') AS [arg_otbn_area],
                        ISNULL([argentina_presence], ''''false'''') AS [argentina_presence]
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
						[dissolved_geom_object_key] [nvarchar](300),
                        [tree_cover_loss_arg_otbn_yearly] [nvarchar](max),
                        [arg_otbn_area] [nvarchar](max),
                        [argentina_presence] [nvarchar](50)

					)
					
					-- Create a temp table and join both the dynamodb data with the analysis table, making sure to include the location_status_id
					-- Cleaning up and converting the JSON analysis data into the analysis table
					SET @TEMPLATE = ''''
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
							D.[dissolved_geom_object_key],
                            D.[tree_cover_loss_arg_otbn_yearly],
                            D.[arg_otbn_area],
                            D.[argentina_presence]
						INTO dbo.[temp_merged_analysis_table]
						FROM [temp_analysis_table] AS D 
						RIGHT JOIN [{ANALYSIS_TABLE}] AS L ON D.location_id = L.location_id ORDER BY L.location_id ASC

						TRUNCATE TABLE [{ANALYSIS_TABLE}]

						-- Insert back into the analysis table
						INSERT INTO [{ANALYSIS_TABLE}]
						SELECT * FROM [temp_merged_analysis_table]

						DROP TABLE IF EXISTS [temp_analysis_table]

						SELECT COUNT(*) AS analysesCount FROM [{ANALYSIS_TABLE}]
					''''

					-- Add location template
					SET @APPEND_LOCATION_TEMPLATE = ''''
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
							D.[dissolved_geom_object_key],
                            D.[tree_cover_loss_arg_otbn_yearly],
                            D.[arg_otbn_area],
                            D.[argentina_presence]
						INTO dbo.[temp_merged_analysis_table]
						FROM [temp_analysis_table] AS D 
						INNER JOIN [{ANALYSIS_TABLE}] AS L ON D.location_id = L.location_id ORDER BY L.location_id ASC

						-- Deleting new locations from existing list
						DELETE FROM [{ANALYSIS_TABLE}] WHERE location_id IN (
							SELECT [location_id]
							FROM dbo.[temp_merged_analysis_table]
						)

						-- Append the new locations to the existing list
						INSERT INTO [{ANALYSIS_TABLE}]
						SELECT * FROM 
						dbo.[temp_merged_analysis_table]

						-- Dropping the temporary analysis table
						DROP TABLE IF EXISTS [temp_analysis_table]

						SELECT COUNT(*) AS analysesCount FROM [{ANALYSIS_TABLE}]
					''''

					IF @append_locations = 0
					BEGIN
						SET @SQL = REPLACE(@TEMPLATE, ''''{ANALYSIS_TABLE}'''', @analysis_table)
					END
					ELSE
					BEGIN
						SET @SQL = REPLACE(@APPEND_LOCATION_TEMPLATE, ''''{ANALYSIS_TABLE}'''', @analysis_table)
					END
					EXEC sp_executesql @SQL
				'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL


		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetAdminAreas
							@listID INT
						AS
						DECLARE @listLocationTableName NVARCHAR(1000)
						DECLARE @SQL NVARCHAR(MAX)

						-- Obtain the location table name and the analysis table name for the list.
						SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @listID

						-- Obtain the needed columns from the List Location Table. (All but Geometry)
						SET @SQL = ''''SELECT DISTINCT Country, State, [Sub State] From [''''+@listLocationTableName+''''] ORDER BY Country, State, [Sub State]''''

						EXEC sp_executesql @SQL, 
											N''''@listLocationTableName AS NVARCHAR(1000)'''',
											@listLocationTableName=@listLocationTableName

						'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL


		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspUpsertAnalysesDashboard
							@list_id INT,
							@DashboardUpdates [TT-Analyses-Dashboard] READONLY
						AS

						BEGIN

							ALTER INDEX ALL ON dbo.[Analyses-Dashboard] DISABLE;

							BEGIN TRANSACTION

								/* HANDLE DELETE, IF DISSOLVED LIST */
								DELETE TT
								FROM dbo.[Analyses-Dashboard] TT
								WHERE TT.list_id = @list_id AND location_id = -1;


								/* HANDLE UPDATE, IF EXISTS IN DASHBOARD TABLE */
								UPDATE TT
								SET TT.glad_alerts_coverage = SRC.glad_alerts_coverage
									, TT.glad_alerts_daily = SRC.glad_alerts_daily
									, TT.glad_alerts_weekly = SRC.glad_alerts_weekly
									, TT.glad_alerts_monthly = SRC.glad_alerts_monthly
									, TT.viirs_alerts_daily = SRC.viirs_alerts_daily
									, TT.tree_cover_extent_total = SRC.tree_cover_extent_total
								FROM dbo.[Analyses-Dashboard] AS TT	
								INNER JOIN @DashboardUpdates AS SRC
								ON TT.list_id = SRC.list_id
									AND TT.location_id = SRC.location_id
									AND TT.gadm_id = SRC.gadm_id
								WHERE TT.list_id = @list_id;


								/* HANDLE INSERT, IF NOT EXISTS IN DASHBOARD TABLE*/
								INSERT INTO dbo.[Analyses-Dashboard] (
									list_id, location_id, gadm_id, glad_alerts_coverage, glad_alerts_daily, glad_alerts_weekly, glad_alerts_monthly, viirs_alerts_daily, tree_cover_extent_total
								)
								SELECT list_id, location_id, gadm_id, glad_alerts_coverage, glad_alerts_daily, glad_alerts_weekly, glad_alerts_monthly, viirs_alerts_daily, tree_cover_extent_total
								FROM @DashboardUpdates SRC
								WHERE NOT EXISTS(
									SELECT *
									FROM dbo.[Analyses-Dashboard] AS TT
									WHERE TT.list_id = SRC.list_id 
										AND TT.location_id = SRC.location_id
										AND TT.gadm_id = SRC.gadm_id
								);

							COMMIT TRANSACTION	

							ALTER INDEX ALL ON dbo.[Analyses-Dashboard] REBUILD;

						END

						'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		/*
			Stored procedures for filtered results
		*/
		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetAnalysisDataCountForUserList
						@listID INT,
						@Country NVARCHAR(150) = NULL,
						@State NVARCHAR(150) = NULL,
						@SubState NVARCHAR(150) = NULL,
						@AnalysisAreaMin INT = NULL,
						@AnalysisAreaMax INT = NULL,
						@SearchString NVARCHAR(MAX) = NULL,
						@selectedSupplier NVARCHAR(150) = NULL,
						@selectedSecondSupplier NVARCHAR(150) = NULL,
						@selectedParentCompany NVARCHAR(150) = NULL,
						@showRSPOCertified BIT = 0,
						@selectedOverallThreats NVARCHAR(150) = NULL,
						@selectedOverallValues NVARCHAR(150) = NULL,
						@selectedMillPriority NVARCHAR(150) = NULL
					AS
						
					DECLARE @listLocationTableName NVARCHAR(1000)
					DECLARE @listAnalysisTableName NVARCHAR(1000)
					DECLARE @CTE NVARCHAR(MAX)
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)
					DECLARE @Filters NVARCHAR(MAX) = ''''''''
					DECLARE @AnalysisFilters NVARCHAR(MAX) = ''''''''
					DECLARE @listLocationTableCols NVARCHAR(MAX)
					DECLARE @where_clauses NVARCHAR(max) = '''''''';

					-- Find the issue in this code

					SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name FROM dbo.Lists WHERE id = @listID

						BEGIN

							SET @CTE = ''''SELECT L.location_id FROM dbo.[{LIST_TABLE_NAME}] L''''

							--- SET FILTERS			
							IF @Country IS NOT NULL 
								SET @Filters = + @Filters + '''' AND Country = @Country''''

							IF @State IS NOT NULL 
								SET @Filters = + @Filters + '''' AND State = @State''''

							IF @SubState IS NOT NULL 
								SET @Filters = + @Filters + '''' AND [Sub State] = @SubState''''
							IF @selectedSupplier IS NOT NULL
								SET @Filters = + @Filters + '''' AND [Supplier Name] = @selectedSupplier''''
							IF @selectedSecondSupplier IS NOT NULL
								SET @Filters = + @Filters + '''' AND [Second Supplier Name] = @selectedSecondSupplier''''
							IF @selectedParentCompany IS NOT NULL
								SET @Filters = + @Filters + '''' AND [Parent Company] = @selectedParentCompany''''
							IF @showRSPOCertified = 1
								SET @Filters = + @Filters + '''' AND [RSPO Model] = 1''''

							IF @SearchString IS NOT NULL
							BEGIN
								SELECT @listLocationTableCols = STUFF(
								(
									SELECT ''''], L.['''' + [name] FROM sys.columns
									WHERE
									[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
									AND [name] NOT IN (''''Geometry'''', ''''location_id'''')
										AND user_type_id IN (SELECT user_type_id FROM sys.types WHERE name IN (''''char'''', ''''nchar'''', ''''varchar'''', ''''nvarchar''''))
									FOR XML PATH('''''''')
								),1,3,'''' '''') + '''']'''';

								DECLARE @SearchLogic NVARCHAR(MAX) = ''''CONCAT({LIST_TABLE_CHAR_COLS}) LIKE ''''''''%{SEARCH_STRING}%'''''''' '''';
								SET @SearchLogic = REPLACE(@SearchLogic, ''''{LIST_TABLE_CHAR_COLS}'''', @listLocationTableCols);
								SET @SearchLogic = REPLACE(@SearchLogic, ''''{SEARCH_STRING}'''', @SearchString);
								SET @Filters = CONCAT(@Filters,'''' AND '''', @SearchLogic);
							END

							IF @AnalysisAreaMin IS NOT NULL AND @AnalysisAreaMax IS NOT NULL
							BEGIN 
								IF @AnalysisAreaMin < 0 AND @AnalysisAreaMin < @AnalysisAreaMax
									BEGIN
										RAISERROR (''''Invalid @AnalysisAreaMin'''', -1, 1); 
									END
								IF @AnalysisAreaMax < 0 AND @AnalysisAreaMax > @AnalysisAreaMin
									BEGIN
										RAISERROR (''''Invalid @AnalysisAreaMax'''', -1, 1); 
									END
								SET @AnalysisFilters = '''' INNER JOIN (
									SELECT location_id FROM dbo.[{LIST_ANALYSIS_TABLE_NAME}]
									WHERE total_area BETWEEN {ANALYSIS_AREA_MIN} AND {ANALYSIS_AREA_MAX}
									) A ON A.location_id = L.location_id'''';
								SET @AnalysisFilters = REPLACE(@AnalysisFilters, ''''{ANALYSIS_AREA_MIN}'''', @AnalysisAreaMin);
								SET @AnalysisFilters = REPLACE(@AnalysisFilters, ''''{ANALYSIS_AREA_MAX}'''', @AnalysisAreaMax);
								SET @AnalysisFilters = REPLACE(@AnalysisFilters, ''''{LIST_ANALYSIS_TABLE_NAME}'''', @listAnalysisTableName)
							END
							
						IF @selectedOverallThreats IS NOT NULL
						BEGIN
							set @where_clauses = ''''(SELECT TOP 1 CAST(value AS INT) AS last_property
													FROM OPENJSON(commodity_threat_overall_level)
													WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_threat_overall_level) ORDER BY [key] DESC)
													AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallThreats))) IS NOT NULL''''
						END
						IF @selectedOverallValues IS NOT NULL
						BEGIN
							IF @where_clauses <> ''''''''
								SET @where_clauses = @where_clauses + '''' AND '''';

									set @where_clauses = @where_clauses + ''''(SELECT TOP 1 CAST(value AS INT) AS last_property
													FROM OPENJSON(commodity_value_overall_level)
													WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_value_overall_level) ORDER BY [key] DESC)
													AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallValues))) IS NOT NULL''''

						END
						IF @selectedMillPriority IS NOT NULL
						BEGIN
							IF @where_clauses <> ''''''''
								SET @where_clauses = @where_clauses + '''' AND '''';
							set @where_clauses = @where_clauses + ''''(SELECT TOP 1 CAST(value AS INT) AS last_property
												FROM OPENJSON(commodity_mill_priority_level)
												WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_mill_priority_level) ORDER BY [key] DESC)
												AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedMillPriority))) IS NOT NULL''''

						END
								IF @where_clauses <> ''''''''
								SET @CTE = @CTE + @AnalysisFilters + '''' WHERE L.location_id IN 
							(
							SELECT DISTINCT A.location_id 
							FROM dbo.[{LIST_ANALYSIS_TABLE_NAME}] A
							WHERE ''''+ @where_clauses +'''' ) '''' + @Filters;
							ELSE
								SET @CTE = @CTE + @AnalysisFilters + '''' WHERE 1=1'''' + @Filters;

							SET @CTE = REPLACE(@CTE, ''''{LIST_TABLE_NAME}'''', @listLocationTableName)

							SET @TEMPLATE = ''''WITH Locations_CTE AS ( {LOCATION_CTE} )

								SELECT ''''''''Row Count'''''''' AS statistic_type, COUNT(location_id) AS statistic
								FROM Locations_CTE
								UNION ALL
								SELECT ''''''''Max Area'''''''', ISNULL(MAX(total_area),0)
								FROM dbo.[{LIST_ANALYSIS_TABLE_NAME}]
								WHERE {WHERE_CLAUSES}''''

							IF @where_clauses = ''''''''
								SET @where_clauses = ''''1=1''''
							SET @TEMPLATE = REPLACE(@TEMPLATE, ''''{WHERE_CLAUSES}'''', @where_clauses)

							SET @SQL = REPLACE(@TEMPLATE, ''''{LOCATION_CTE}'''', @CTE)
							SET @SQL = REPLACE(@SQL, ''''{LIST_ANALYSIS_TABLE_NAME}'''', @listAnalysisTableName)
							PRINT @SQL
							EXEC sp_executesql @SQL, 
									N''''@Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaMin INT, @AnalysisAreaMax INT,@selectedSupplier NVARCHAR(150),@selectedSecondSupplier NVARCHAR(150),@selectedParentCompany NVARCHAR(150),@showRSPOCertified BIT,@selectedOverallThreats NVARCHAR(150),@selectedOverallValues NVARCHAR(150),@selectedMillPriority NVARCHAR(150)'''',
									@Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaMin=@AnalysisAreaMin, @AnalysisAreaMax=@AnalysisAreaMax, @selectedSupplier=@selectedSupplier,@selectedSecondSupplier=@selectedSecondSupplier,@selectedParentCompany=@selectedParentCompany,@showRSPOCertified=@showRSPOCertified,@selectedOverallThreats=@selectedOverallThreats,@selectedOverallValues=@selectedOverallValues,@selectedMillPriority=@selectedMillPriority;

					END
					 '')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspGetAnalysisDataForUserList

						@listID INT,
						@OrderByColumn NVARCHAR(MAX) = NULL, -- [Investment Name]
						@Order NVARCHAR(5) = ''''ASC'''',
						@Country NVARCHAR(150) = NULL,
						@State NVARCHAR(150) = NULL,
						@SubState NVARCHAR(150) = NULL,
						@AnalysisAreaFilter float = NULL,
						@AnalysisAreaOperator VARCHAR(10)=''''>''''

						AS

						DECLARE @listLocationTableName NVARCHAR(1000)
						DECLARE @listAnalysisTableName NVARCHAR(1000)
						DECLARE @listLocationTableCols NVARCHAR(MAX)
						DECLARE @SQL NVARCHAR(MAX)
						DECLARE @Filters NVARCHAR(MAX) = ''''''''

						-- Obtain the location table name and the analysis table name for the list.
						SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name FROM Lists WHERE id = @listID

						-- Default column location name is not found
						IF @OrderByColumn = ''''[Location Name]'''' AND COL_LENGTH(@listLocationTableName, ''''Location Name'''') IS NULL
						BEGIN
							SET @OrderByColumn = ''''[Investment Name]''''
						END


						-- Obtain the needed columns from the List Location Table. (All but Geometry)
						SELECT @listLocationTableCols = STUFF(
							(
								SELECT ''''], L.['''' + [name] FROM sys.columns
								WHERE
									[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
									AND [name] NOT IN (''''Geometry'''')
									FOR XML PATH('''''''')
							),1,3,'''''''') + '''']'''';

						SET @SQL = N'''';WITH MyListTable AS (SELECT {LIST_ID} AS list_id, {LOCATION_COLUMNS} FROM [{LOCATION_TABLE}] L), '''';			

						DECLARE @listAnalysisTableCols NVARCHAR(MAX)

						-- Obtain the needed columns from the List Analysis Table. (All but List ID)
						SELECT @listAnalysisTableCols = STUFF(
							(
								SELECT ''''], A.['''' + [name] FROM sys.columns
								WHERE
									[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listAnalysisTableName)
									AND [name] NOT IN (''''id'''')
									FOR XML PATH('''''''')
							),1,3,'''''''') + '''']'''';

						-- ADD Filters
						IF @Country IS NOT NULL 
							SET @Filters = + @Filters + '''' AND Country = @Country''''

						IF @State IS NOT NULL 
							SET @Filters = + @Filters + '''' AND State = @State''''

						IF @SubState IS NOT NULL 
							SET @Filters = + @Filters + '''' AND [Sub State] = @SubState''''

						IF ISNUMERIC( @AnalysisAreaFilter ) = 1
						BEGIN
							IF @AnalysisAreaOperator NOT IN(''''>='''', ''''<='''', ''''<'''', ''''>'''')
								RAISERROR (''''Invalid @AnalysisAreaOperator'''', -1, 1); 
							SET @Filters = + @Filters + '''' AND [Analysis Area] '''' + @AnalysisAreaOperator + '''' @AnalysisAreaFilter ''''
						END


						-- Return data from both tables
						SET @SQL = @SQL + '''' MyAnalysisTable AS(SELECT {LIST_ID} AS analysis_list_id, {ANALYSIS_COLUMNS} FROM [{ANALYSIS_TABLE}] A) 
											SELECT * FROM MyListTable INNER JOIN MyAnalysisTable ON MyListTable.list_id = MyAnalysisTable.analysis_list_id AND  MyListTable.location_id = MyAnalysisTable.location_id 
											WHERE 1=1 ''''+@Filters+''''
											ORDER BY ''''+@OrderByColumn + '''' ''''+@Order;

						SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listID);
						SET @SQL = REPLACE(@SQL, ''''{LOCATION_COLUMNS}'''', @listLocationTableCols);
						SET @SQL = REPLACE(@SQL, ''''{LOCATION_TABLE}'''', @listLocationTableName);
						SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_COLUMNS}'''', @listAnalysisTableCols);
						SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_TABLE}'''', @listAnalysisTableName);

						EXEC sp_executesql @SQL, 
							N''''@OrderByColumn NVARCHAR(MAX), @Order NVARCHAR(5), @Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaFilter FLOAT, @AnalysisAreaOperator VARCHAR(10)'''',
							@OrderByColumn=@OrderByColumn, @Order=@Order, @Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaFilter=@AnalysisAreaFilter, @AnalysisAreaOperator=@AnalysisAreaOperator;

					 '')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
						EXEC(''CREATE PROCEDURE uspDeleteLocationIdsFilteredDataForUserList
						@listID INT,
							@Country NVARCHAR(150) = NULL,
							@State NVARCHAR(150) = NULL,
							@SubState NVARCHAR(150) = NULL,
							@AnalysisAreaMin INT = NULL,
							@AnalysisAreaMax INT = NULL,
							@SearchString NVARCHAR(MAX) = NULL,
							@SelectedLocations NVARCHAR(MAX) = NULL,
							@Debug BIT = 0
						AS

						DECLARE @listLocationTableName NVARCHAR(1000)
						DECLARE @listAnalysisTableName NVARCHAR(1000)
						DECLARE @listLocationTableCols NVARCHAR(MAX)
						DECLARE @SQL NVARCHAR(MAX)
						DECLARE @Filters NVARCHAR(MAX) = ''''''''
						DECLARE @TEMPLATE NVARCHAR(MAX)
						DECLARE @AnalysisFilters NVARCHAR(MAX) = ''''1=1''''

						SET NOCOUNT ON
						-- Obtain the location table name and the analysis table name for the list.
						SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name FROM Lists WHERE id = @listID


						SET @SQL = N''''
									DECLARE @KeyValuesHoldingTable TABLE (
										location_id INT
									)
									;WITH MyListTable AS (SELECT location_id as list_location_id, {LIST_ID} As list_id FROM [{LOCATION_TABLE}] '''';

							IF @Country IS NOT NULL 
								SET @Filters = + @Filters + '''' AND Country = @Country''''

							IF @State IS NOT NULL 
								SET @Filters = + @Filters + '''' AND State = @State''''

							IF @SubState IS NOT NULL 
								SET @Filters = + @Filters + '''' AND [Sub State] = @SubState''''

							IF @SearchString IS NOT NULL
							BEGIN

								SELECT @listLocationTableCols = STUFF(
								(
									SELECT ''''], ['''' + [name] FROM sys.columns
									WHERE
									[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
									AND [name] NOT IN (''''Geometry'''', ''''location_id'''')
										AND user_type_id IN (SELECT user_type_id FROM sys.types WHERE name IN (''''char'''', ''''nchar'''', ''''varchar'''', ''''nvarchar''''))
									FOR XML PATH('''''''')
								),1,3,'''' '''') + '''']'''';

								DECLARE @SearchLogic NVARCHAR(MAX) = ''''CONCAT({LIST_TABLE_CHAR_COLS}) LIKE ''''''''%{SEARCH_STRING}%'''''''' '''';
								SET @SearchLogic = REPLACE(@SearchLogic, ''''{LIST_TABLE_CHAR_COLS}'''', @listLocationTableCols);
								SET @SearchLogic = REPLACE(@SearchLogic, ''''{SEARCH_STRING}'''', @SearchString);
								--PRINT @SearchLogic;
								SET @Filters = CONCAT(@Filters,'''' AND '''', @SearchLogic);
							END


							IF ISNUMERIC( @AnalysisAreaMin ) = 1 AND ISNUMERIC( @AnalysisAreaMax ) = 1
							BEGIN
								
								IF @AnalysisAreaMin < 0 AND @AnalysisAreaMin < @AnalysisAreaMax
									BEGIN
										RAISERROR (''''Invalid @AnalysisAreaMin'''', -1, 1); 
									END
								IF @AnalysisAreaMax < 0 AND @AnalysisAreaMax > @AnalysisAreaMin
									BEGIN
										RAISERROR (''''Invalid @AnalysisAreaMax'''', -1, 1); 
									END
								SET @AnalysisFilters = ''''total_area BETWEEN {ANALYSIS_AREA_MIN} AND {ANALYSIS_AREA_MAX}'''';
								SET @AnalysisFilters = REPLACE(@AnalysisFilters, ''''{ANALYSIS_AREA_MIN}'''', @AnalysisAreaMin);
								SET @AnalysisFilters = REPLACE(@AnalysisFilters, ''''{ANALYSIS_AREA_MAX}'''', @AnalysisAreaMax);	
							END

							IF @SelectedLocations IS NOT NULL
							BEGIN
								SET @Filters = CONCAT(@Filters,'''' AND location_id IN('''',@SelectedLocations ,'''')'''');
							END

						-- Return data from both tables
						SET @SQL = @SQL + '''' WHERE 1=1 ''''+@Filters + ''''),
							MyAnalysisTable AS(
								SELECT {LIST_ID} As analysis_list_id, location_id 
								FROM [{ANALYSIS_TABLE}] A
								WHERE '''' + @AnalysisFilters + ''''
							)

						INSERT INTO @KeyValuesHoldingTable SELECT location_id FROM MyListTable
												INNER JOIN MyAnalysisTable ON MyListTable.list_id = MyAnalysisTable.analysis_list_id AND MyListTable.list_location_id = MyAnalysisTable.location_id
						'''';

							SET @TEMPLATE = ''''DELETE FROM [{TABLE_NAME}] WHERE location_id IN (SELECT * FROM @KeyValuesHoldingTable)
							''''
							SET @SQL = @SQL + REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', @listLocationTableName)

							SET @TEMPLATE = ''''DELETE FROM [{TABLE_NAME}] WHERE location_id IN (SELECT * FROM @KeyValuesHoldingTable)
							''''
							SET @SQL = @SQL + REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', @listAnalysisTableName)
							
							SET @TEMPLATE = ''''DELETE FROM [{TABLE_NAME}] WHERE list_id = {LIST_ID}
											AND (location_id = -1 OR location_id IN (SELECT * FROM @KeyValuesHoldingTable))
											''''
							SET @SQL = @SQL + REPLACE(@TEMPLATE, ''''{TABLE_NAME}'''', ''''Analyses-Dashboard'''')
							SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''',  @listID)
							SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_TABLE}'''', @listAnalysisTableName);

						SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listID);
						SET @SQL = REPLACE(@SQL, ''''{LOCATION_TABLE}'''', @listLocationTableName);

						IF @Debug = 0
							EXEC sp_executesql @SQL, 
											N''''@Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaMin INT, @AnalysisAreaMax INT'''',
											@Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaMin=@AnalysisAreaMin, @AnalysisAreaMax=@AnalysisAreaMax;
						ELSE
							print @SQL								
						'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
				EXEC(''CREATE PROCEDURE uspGetLocationsFilteredToCopy
					@listID INT,
					@OrderByColumn NVARCHAR(MAX) = ''''Location Name'''',
					@Order NVARCHAR(5) = ''''ASC'''',
					@SubState NVARCHAR(150) = NULL,
					@Country NVARCHAR(150) = NULL,
					@State NVARCHAR(150) = NULL,
					@AnalysisAreaMin INT = NULL,
					@AnalysisAreaMax INT = NULL,
					@LocationLogic NVARCHAR(50) = NULL,
					@LocationIds NVARCHAR(MAX) = NULL,
					@LocationStatement NVARCHAR(MAX) = NULL,
					@ColumnsToReturn NVARCHAR(MAX) = NULL,
					@SearchString NVARCHAR(MAX) = NULL,
					@SelectedLocations NVARCHAR(MAX) = NULL,
					@Geometry BIT = 1
				AS
					BEGIN

						DECLARE @columnsList NVARCHAR(1000)
						DECLARE @listLocationTableName NVARCHAR(1000)
						DECLARE @listAnalysisTableName NVARCHAR(1000)
						DECLARE @ListColumnsWhereclause NVARCHAR(MAX) = ''''AND [name] NOT IN (''''''''Geometry'''''''', ''''''''location_id'''''''')''''
						DECLARE @AnalysisColumnsWhereclause NVARCHAR(MAX) = ''''AND [name] NOT IN (''''''''Geometry'''''''')''''
						DECLARE @listLocationTableCols NVARCHAR(MAX)
						DECLARE @listAnalysisTableCols NVARCHAR(MAX)
						DECLARE @template_id INT
						DECLARE @PRESQL NVARCHAR(MAX)
						DECLARE @presql_list_params NVARCHAR(MAX) = ''''@list_location_table_cols_query VARCHAR(MAX) OUTPUT'''';
						DECLARE @presql_analysis_params NVARCHAR(MAX) = ''''@analysis_location_table_cols_query VARCHAR(MAX) OUTPUT'''';
						DECLARE @list_location_table_cols_output NVARCHAR(MAX);
						DECLARE @analysis_location_table_cols_output NVARCHAR(MAX);
						DECLARE @SQL NVARCHAR(MAX)
						DECLARE @Filters NVARCHAR(MAX) = ''''''''
						DECLARE @AnalysisFilters NVARCHAR(MAX) = ''''1=1''''


						SET NOCOUNT ON
						-- Obtain the location table name and the analysis table name for the list.
						SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name, @template_id = template_id FROM dbo.Lists WHERE id = @listID

						-- Default column location name is not found
						IF @OrderByColumn = ''''Location Name''''
						BEGIN
							IF COL_LENGTH(@listLocationTableName, ''''Location Name'''') IS NULL
							BEGIN
								SET @OrderByColumn = ''''[Investment Name]''''
							END
							ELSE 
							BEGIN
								SET @OrderByColumn = ''''[Location Name]''''
							END
						END
						IF @OrderByColumn = ''''Investment Name'''' 
						BEGIN
							IF COL_LENGTH(@listLocationTableName, ''''Investment Name'''') IS NULL
							BEGIN
								SET @OrderByColumn = ''''[Location Name]''''
							END
							ELSE
							BEGIN
								SET @OrderByColumn = ''''[Investment Name]''''
							END
						END

						IF @OrderByColumn NOT IN (''''Investment Name'''', ''''Location Name'''', ''''[Investment Name]'''',''''[Location Name]'''')
						BEGIN
							SET @OrderByColumn = ''''[''''+@OrderByColumn+'''']''''
						END

						-- Obtain the needed columns from the List Location Table. (All but Geometry)
						IF @ColumnsToReturn IS NOT NULL
						BEGIN
							WITH ColumnsCTE AS (
								SELECT TRIM(value) AS cols FROM STRING_SPLIT(@ColumnsToReturn, '''','''')
							)

							SELECT @columnsList = CONCAT('''''''''''''''', STRING_AGG(cols, '''''''''''', ''''''''''''), '''''''''''''''')
							FROM ColumnsCTE;

							SET @ListColumnsWhereclause = CONCAT(@ListColumnsWhereclause, '''' '''', ''''AND [name] IN (''''''''Location Name'''''''', ''''''''Investment Name'''''''', ''''''''Country'''''''', ''''''''State'''''''', ''''''''Sub State'''''''', '''', @columnsList, '''')'''')
							SET @AnalysisColumnsWhereclause = CONCAT(@AnalysisColumnsWhereclause, '''' '''', ''''AND [name] IN (''''''''location_id'''''''', ''''''''total_area'''''''', '''', @columnsList, '''')'''')

						END

						SET @PRESQL = N''''SELECT @list_location_table_cols_query = STUFF(
							  (
								SELECT ''''''''], L.['''''''' + [name] FROM sys.columns
								WHERE
								  [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = ''''''''{LIST_LOCATION_TABLE_NAME}'''''''')
								  {WHERE_CLAUSE} 
								  FOR XML PATH('''''''''''''''')
							  ),1,3,'''''''''''''''') + '''''''']'''''''''''';
						SET @PRESQL = REPLACE(@PRESQL, ''''{LIST_LOCATION_TABLE_NAME}'''', @listLocationTableName)
						SET @PRESQL = REPLACE(@PRESQL, ''''{WHERE_CLAUSE}'''', @ListColumnsWhereclause);

						EXEC sp_executesql @PRESQL, @presql_list_params, @list_location_table_cols_query = @list_location_table_cols_output OUTPUT;

						SET @SQL = N''''; WITH MyListTable AS (SELECT {LIST_ID} AS list_id, {LOCATION_COLUMNS}, location_id AS list_location_id''''      
						IF @Geometry = 1
						BEGIN
						  SET @SQL = @SQL + '''', Geometry.ToString() AS [WKTGeometry]''''
						END     

						SET @SQL = @SQL + '''' FROM [{LOCATION_TABLE}] L), '''';

						SET @PRESQL = N''''SELECT @analysis_location_table_cols_query = STUFF(
							  (
								SELECT ''''''''], A.['''''''' + [name] FROM sys.columns
								WHERE
								  [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = ''''''''{LIST_ANALYSIS_TABLE_NAME}'''''''')
								  {WHERE_CLAUSE} 
								  FOR XML PATH('''''''''''''''')
							  ),1,3,'''''''''''''''') + '''''''']'''''''''''';
						SET @PRESQL = REPLACE(@PRESQL, ''''{LIST_ANALYSIS_TABLE_NAME}'''', @listAnalysisTableName)
						SET @PRESQL = REPLACE(@PRESQL, ''''{WHERE_CLAUSE}'''', @AnalysisColumnsWhereclause);

						EXEC sp_executesql @PRESQL, @presql_analysis_params, @analysis_location_table_cols_query = @analysis_location_table_cols_output OUTPUT;

						-- Obtain the needed columns from the List Analysis Table. (All but List ID)
						SELECT @listAnalysisTableCols = STUFF(
						  (
							SELECT ''''], A.['''' + [name] FROM sys.columns
							WHERE
							  [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listAnalysisTableName)
							  AND [name] NOT IN (''''id'''')
							  FOR XML PATH('''''''')
						  ),1,3,'''''''') + '''']'''';

						  -- ADD Filters
						IF @Country IS NOT NULL 
						  SET @Filters = + @Filters + '''' AND Country = @Country''''

						IF @State IS NOT NULL 
						  SET @Filters = + @Filters + '''' AND State = @State''''

						IF @SubState IS NOT NULL 
						  SET @Filters = + @Filters + '''' AND [Sub State] = @SubState''''

						IF @LocationLogic IS NOT NULL AND @LocationIds IS NOT NULL
						BEGIN
							IF CHARINDEX(''''IN'''', @LocationLogic) > 0
								BEGIN
									SET @LocationStatement = ''''AND location_id '''' + @LocationLogic + '''' ('''' + @LocationIds + '''')''''
									SET @Filters = CONCAT(@Filters, '''' '''', @LocationStatement);
								END
							IF CHARINDEX(''''BETWEEN'''', @LocationLogic) > 0
								BEGIN
									DECLARE @BetweenLogic NVARCHAR(1000) = '''' AND location_id '''' + @LocationLogic;
									WITH LocationIdsCTE AS (
										SELECT value AS locations FROM STRING_SPLIT(@LocationIds, '''','''')
									)

									SELECT @LocationStatement = STRING_AGG(locations, @BetweenLogic) 
									FROM LocationIdsCTE;

									SET @Filters = CONCAT(@Filters,'''' AND location_id '''', @LocationLogic, '''' '''', @LocationStatement);
								END
						END

						IF @SearchString IS NOT NULL
						BEGIN

							SELECT @listLocationTableCols = STUFF(
							  (
								SELECT ''''], ['''' + [name] FROM sys.columns
								WHERE
								  [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
								  AND [name] NOT IN (''''Geometry'''', ''''location_id'''')
									AND user_type_id IN (SELECT user_type_id FROM sys.types WHERE name IN (''''char'''', ''''nchar'''', ''''varchar'''', ''''nvarchar''''))
								  FOR XML PATH('''''''')
							  ),1,3,'''' '''') + '''']'''';

							DECLARE @SearchLogic NVARCHAR(MAX) = ''''CONCAT({LIST_TABLE_CHAR_COLS}) LIKE ''''''''%{SEARCH_STRING}%'''''''' '''';
							SET @SearchLogic = REPLACE(@SearchLogic, ''''{LIST_TABLE_CHAR_COLS}'''', @listLocationTableCols);
							SET @SearchLogic = REPLACE(@SearchLogic, ''''{SEARCH_STRING}'''', @SearchString);
							SET @Filters = CONCAT(@Filters,'''' AND '''', @SearchLogic);

						END

						IF ISNUMERIC( @AnalysisAreaMin ) = 1 AND ISNUMERIC( @AnalysisAreaMax ) = 1
						BEGIN

							IF @AnalysisAreaMin < 0 AND @AnalysisAreaMin < @AnalysisAreaMax
								BEGIN
									RAISERROR (''''Invalid @AnalysisAreaMin'''', -1, 1); 
								END
							IF @AnalysisAreaMax < 0 AND @AnalysisAreaMax > @AnalysisAreaMin
								BEGIN
									RAISERROR (''''Invalid @AnalysisAreaMax'''', -1, 1); 
								END
							SET @AnalysisFilters = ''''total_area BETWEEN {ANALYSIS_AREA_MIN} AND {ANALYSIS_AREA_MAX}'''';
							SET @AnalysisFilters = REPLACE(@AnalysisFilters, ''''{ANALYSIS_AREA_MIN}'''', @AnalysisAreaMin);
							SET @AnalysisFilters = REPLACE(@AnalysisFilters, ''''{ANALYSIS_AREA_MAX}'''', @AnalysisAreaMax);

						END

						IF @SelectedLocations IS NOT NULL
						BEGIN
							SET @Filters = CONCAT(@Filters,'''' AND location_id IN('''',@SelectedLocations ,'''')'''');
						END

						-- Return data from both tables
						SET @SQL = @SQL + '''' MyAnalysisTable AS(
							SELECT {LIST_ID} As analysis_list_id, {TEMPLATE_ID} As template_id, {ANALYSIS_COLUMNS}
							FROM [{ANALYSIS_TABLE}] A
							WHERE '''' + @AnalysisFilters + ''''
						) 
						SELECT * FROM MyListTable
						INNER JOIN MyAnalysisTable ON MyListTable.list_id = MyAnalysisTable.analysis_list_id AND MyListTable.list_location_id = MyAnalysisTable.location_id 
						WHERE 1=1 ''''+@Filters+''''
						ORDER BY ''''+ @OrderByColumn + '''' ''''+ @Order

						SET @SQL = REPLACE(@SQL, ''''{TEMPLATE_ID}'''', @template_id);
						SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listID);	
						SET @SQL = REPLACE(@SQL, ''''{LOCATION_COLUMNS}'''', @list_location_table_cols_output);
						SET @SQL = REPLACE(@SQL, ''''{LOCATION_TABLE}'''', @listLocationTableName);
						SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_COLUMNS}'''', @analysis_location_table_cols_output);
						SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_TABLE}'''', @listAnalysisTableName);

						EXEC sp_executesql @SQL, 
								  N''''@OrderByColumn NVARCHAR(MAX), @Order NVARCHAR(5), @Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaMin INT, @AnalysisAreaMax INT'''',
								  @OrderByColumn=@OrderByColumn, @Order=@Order, @Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaMin=@AnalysisAreaMin, @AnalysisAreaMax=@AnalysisAreaMax;

					END
				'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'USE [{DATABASENAME}]
				EXEC(''CREATE PROCEDURE uspGetPaginatedAnalysisDataForUserList
					  	@listID INT,
						@PageNumber INT = 0,
						@RowsOfPage INT = 0,
						@OrderByColumn NVARCHAR(MAX) = ''''Location Name'''',
						@Order NVARCHAR(5) = ''''ASC'''',
						@SubState NVARCHAR(150) = NULL,
						@Country NVARCHAR(150) = NULL,
						@State NVARCHAR(150) = NULL,
						@AnalysisAreaMin INT = NULL,
						@AnalysisAreaMax INT = NULL,
						@LocationLogic NVARCHAR(50) = NULL,
						@LocationIds NVARCHAR(MAX) = NULL,
						@LocationStatement NVARCHAR(MAX) = NULL,
						@ColumnsToReturn NVARCHAR(MAX) = NULL,
						@SearchString NVARCHAR(MAX) = NULL,
						@Geometry BIT = 0,
						@selectedSupplier NVARCHAR(150) = NULL,
							@selectedSecondSupplier NVARCHAR(150) = NULL,
							@selectedParentCompany NVARCHAR(150) = NULL,
							@showRSPOCertified BIT = 0,
							@selectedOverallThreats NVARCHAR(150) = NULL,
							@selectedOverallValues NVARCHAR(150) = NULL,
							@selectedMillPriority NVARCHAR(150) =  NULL
						AS

						BEGIN

							DECLARE @columnsList NVARCHAR(1000)
							DECLARE @listLocationTableName NVARCHAR(1000)
							DECLARE @listAnalysisTableName NVARCHAR(1000)
							DECLARE @ListColumnsWhereclause NVARCHAR(MAX) = ''''AND [name] NOT IN (''''''''Geometry'''''''', ''''''''location_id'''''''')''''
							DECLARE @AnalysisColumnsWhereclause NVARCHAR(MAX) = ''''AND [name] NOT IN (''''''''Geometry'''''''')''''
							DECLARE @listLocationTableCols NVARCHAR(MAX)
							DECLARE @listAnalysisTableCols NVARCHAR(MAX)
							DECLARE @template_id INT
							DECLARE @PRESQL NVARCHAR(MAX)
							DECLARE @presql_list_params NVARCHAR(MAX) = ''''@list_location_table_cols_query VARCHAR(MAX) OUTPUT'''';
							DECLARE @presql_analysis_params NVARCHAR(MAX) = ''''@analysis_location_table_cols_query VARCHAR(MAX) OUTPUT'''';
							DECLARE @list_location_table_cols_output NVARCHAR(MAX);
							DECLARE @analysis_location_table_cols_output NVARCHAR(MAX);
							DECLARE @SQL NVARCHAR(MAX)
							DECLARE @Filters NVARCHAR(MAX) = ''''''''
							DECLARE @AnalysisFilters NVARCHAR(MAX) = ''''1=1''''
							DECLARE @where_clauses NVARCHAR(max) = '''''''';

							SET NOCOUNT ON
							-- Obtain the location table name and the analysis table name for the list.
							SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name, @template_id = template_id FROM dbo.Lists WHERE id = @listID


							-- Default column location name is not found
							IF @OrderByColumn = ''''Location Name''''
							BEGIN
								IF COL_LENGTH(@listLocationTableName, ''''Location Name'''') IS NULL
								BEGIN
									SET @OrderByColumn = ''''[Investment Name]''''
								END
								ELSE 
								BEGIN
									SET @OrderByColumn = ''''[Location Name]''''
								END
							END
							IF @OrderByColumn = ''''Investment Name'''' 
							BEGIN
								IF COL_LENGTH(@listLocationTableName, ''''Investment Name'''') IS NULL
								BEGIN
									SET @OrderByColumn = ''''[Location Name]''''
								END
								ELSE
								BEGIN
									SET @OrderByColumn = ''''[Investment Name]''''
								END
							END

							IF @OrderByColumn NOT IN (''''Investment Name'''', ''''Location Name'''', ''''[Investment Name]'''',''''[Location Name]'''')
							BEGIN
								SET @OrderByColumn = ''''[''''+@OrderByColumn+'''']''''
							END
							-- Obtain the needed columns from the List Location Table. (All but Geometry)

							IF @ColumnsToReturn IS NOT NULL
							BEGIN
								WITH ColumnsCTE AS (
									SELECT TRIM(value) AS cols FROM STRING_SPLIT(@ColumnsToReturn, '''','''')
								)

								SELECT @columnsList = CONCAT('''''''''''''''', STRING_AGG(cols, '''''''''''', ''''''''''''), '''''''''''''''')
								FROM ColumnsCTE;

								SET @ListColumnsWhereclause = CONCAT(@ListColumnsWhereclause, '''' '''', ''''AND [name] IN (''''''''Location Name'''''''', ''''''''Investment Name'''''''', ''''''''Country'''''''', ''''''''State'''''''', ''''''''Sub State'''''''', '''', @columnsList, '''')'''')


							END

							SET @PRESQL = N''''SELECT @list_location_table_cols_query = STUFF(
								(
									SELECT ''''''''], L.['''''''' + [name] FROM sys.columns
									WHERE
									[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = ''''''''{LIST_LOCATION_TABLE_NAME}'''''''')
									{WHERE_CLAUSE} 
									FOR XML PATH('''''''''''''''')
								),1,3,'''''''''''''''') + '''''''']'''''''''''';
							SET @PRESQL = REPLACE(@PRESQL, ''''{LIST_LOCATION_TABLE_NAME}'''', @listLocationTableName)
							SET @PRESQL = REPLACE(@PRESQL, ''''{WHERE_CLAUSE}'''', @ListColumnsWhereclause);

							EXEC sp_executesql @PRESQL, @presql_list_params, @list_location_table_cols_query = @list_location_table_cols_output OUTPUT;

							SET @SQL = N''''; WITH MyListTable AS (SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS}, location_id as list_location_id''''      
							IF @Geometry = 1
							BEGIN
							SET @SQL = @SQL + '''', Geometry.ToString() As [WKTGeometry]''''
							END     

							SET @SQL = @SQL + '''' FROM [{LOCATION_TABLE}] L), '''';

							SET @PRESQL = N''''SELECT @analysis_location_table_cols_query = STUFF(
								(
									SELECT ''''''''], A.['''''''' + [name] FROM sys.columns
									WHERE
									[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = ''''''''{LIST_ANALYSIS_TABLE_NAME}'''''''')
									{WHERE_CLAUSE} 
									FOR XML PATH('''''''''''''''')
								),1,3,'''''''''''''''') + '''''''']'''''''''''';
							SET @PRESQL = REPLACE(@PRESQL, ''''{LIST_ANALYSIS_TABLE_NAME}'''', @listAnalysisTableName)
							SET @PRESQL = REPLACE(@PRESQL, ''''{WHERE_CLAUSE}'''', @AnalysisColumnsWhereclause);

							EXEC sp_executesql @PRESQL, @presql_analysis_params, @analysis_location_table_cols_query = @analysis_location_table_cols_output OUTPUT;

							SELECT @listAnalysisTableCols = STUFF(
							(
								SELECT ''''], A.['''' + [name] FROM sys.columns
								WHERE
								[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listAnalysisTableName)
								AND [name] NOT IN (''''id'''')
								FOR XML PATH('''''''')
							),1,3,'''''''') + '''']'''';


							-- ADD Filters
							IF @Country IS NOT NULL 
							SET @Filters = + @Filters + '''' AND Country = @Country''''

							IF @State IS NOT NULL 
							SET @Filters = + @Filters + '''' AND State = @State''''

							IF @SubState IS NOT NULL 
							SET @Filters = + @Filters + '''' AND [Sub State] = @SubState''''
							IF @selectedSupplier IS NOT NULL
								SET @Filters = + @Filters + '''' AND [Supplier Name] = @selectedSupplier''''
							IF @selectedSecondSupplier IS NOT NULL
								SET @Filters = + @Filters + '''' AND [Second Supplier Name] = @selectedSecondSupplier''''
							IF @selectedParentCompany IS NOT NULL
								SET @Filters = + @Filters + '''' AND [Parent Company] = @selectedParentCompany''''
							IF @showRSPOCertified = 1
								SET @Filters = + @Filters + '''' AND [RSPO Model] = 1''''
							IF @LocationLogic IS NOT NULL AND @LocationIds IS NOT NULL
							BEGIN
								IF CHARINDEX(''''IN'''', @LocationLogic) > 0
									BEGIN
										SET @LocationStatement = ''''AND location_id '''' + @LocationLogic + '''' ('''' + @LocationIds + '''')''''
										SET @Filters = CONCAT(@Filters, '''' '''', @LocationStatement);
									END
								IF CHARINDEX(''''BETWEEN'''', @LocationLogic) > 0
									BEGIN
										DECLARE @BetweenLogic NVARCHAR(1000) = '''' AND location_id '''' + @LocationLogic;
										WITH LocationIdsCTE AS (
											SELECT value AS locations FROM STRING_SPLIT(@LocationIds, '''','''')
										)

										SELECT @LocationStatement = STRING_AGG(locations, @BetweenLogic) 
										FROM LocationIdsCTE;

										SET @Filters = CONCAT(@Filters,'''' AND location_id '''', @LocationLogic, '''' '''', @LocationStatement);
									END
							END

							IF @SearchString IS NOT NULL
							BEGIN

								SELECT @listLocationTableCols = STUFF(
								(
									SELECT ''''], ['''' + [name] FROM sys.columns
									WHERE
									[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
									AND [name] NOT IN (''''Geometry'''', ''''location_id'''')
										AND user_type_id IN (SELECT user_type_id FROM sys.types WHERE name IN (''''char'''', ''''nchar'''', ''''varchar'''', ''''nvarchar''''))
									FOR XML PATH('''''''')
								),1,3,'''' '''') + '''']'''';

								DECLARE @SearchLogic NVARCHAR(MAX) = ''''CONCAT({LIST_TABLE_CHAR_COLS}) LIKE ''''''''%{SEARCH_STRING}%'''''''' '''';
								SET @SearchLogic = REPLACE(@SearchLogic, ''''{LIST_TABLE_CHAR_COLS}'''', @listLocationTableCols);
								SET @SearchLogic = REPLACE(@SearchLogic, ''''{SEARCH_STRING}'''', @SearchString);
								--PRINT @SearchLogic;
								SET @Filters = CONCAT(@Filters,'''' AND '''', @SearchLogic);
							END


							IF ISNUMERIC( @AnalysisAreaMin ) = 1 AND ISNUMERIC( @AnalysisAreaMax ) = 1
							BEGIN
								--PRINT ''''Analysis Filter'''';  
								--PRINT ''''TEST-'''' + CONVERT(VARCHAR(50), @AnalysisAreaMin) + '''' TO '''' + CONVERT(VARCHAR(50), @AnalysisAreaMax);
								IF @AnalysisAreaMin < 0 AND @AnalysisAreaMin < @AnalysisAreaMax
									BEGIN
										RAISERROR (''''Invalid @AnalysisAreaMin'''', -1, 1); 
									END
								IF @AnalysisAreaMax < 0 AND @AnalysisAreaMax > @AnalysisAreaMin
									BEGIN
										RAISERROR (''''Invalid @AnalysisAreaMax'''', -1, 1); 
									END
								SET @AnalysisFilters = ''''total_area BETWEEN {ANALYSIS_AREA_MIN} AND {ANALYSIS_AREA_MAX}'''';
								SET @AnalysisFilters = REPLACE(@AnalysisFilters, ''''{ANALYSIS_AREA_MIN}'''', @AnalysisAreaMin);
								SET @AnalysisFilters = REPLACE(@AnalysisFilters, ''''{ANALYSIS_AREA_MAX}'''', @AnalysisAreaMax);
								--PRINT @AnalysisFilters;
							END

							-- END Filters
							IF @selectedOverallThreats IS NOT NULL
							BEGIN
								set @where_clauses = ''''(SELECT TOP 1 CAST(value AS INT) AS last_property
														FROM OPENJSON(commodity_threat_overall_level)
														WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_threat_overall_level) ORDER BY [key] DESC)
														AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallThreats))) IS NOT NULL''''
							END
							IF @selectedOverallValues IS NOT NULL
							BEGIN
								IF @where_clauses <> ''''''''
									SET @where_clauses = @where_clauses + '''' AND '''';

										SET @where_clauses = @where_clauses + ''''(SELECT TOP 1 CAST(value AS INT) AS last_property
														FROM OPENJSON(commodity_value_overall_level)
														WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_value_overall_level) ORDER BY [key] DESC)
														AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallValues))) IS NOT NULL''''

							END
							IF @selectedMillPriority IS NOT NULL
							BEGIN
								IF @where_clauses <> ''''''''
									SET @where_clauses = @where_clauses + '''' AND '''';
								SET @where_clauses = @where_clauses + ''''(SELECT TOP 1 CAST(value AS INT) AS last_property
													FROM OPENJSON(commodity_mill_priority_level)
													WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_mill_priority_level) ORDER BY [key] DESC)
													AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedMillPriority))) IS NOT NULL''''
							END
							IF @where_clauses <>''''''''
							SET @AnalysisFilters = @AnalysisFilters + ''''AND'''' + @where_clauses
							-- Return data from both tables
							SET @SQL = @SQL + '''' MyAnalysisTable AS(
													SELECT {LIST_ID} As analysis_list_id, {TEMPLATE_ID} As template_id, {ANALYSIS_COLUMNS}
													FROM [{ANALYSIS_TABLE}] A
													WHERE '''' + @AnalysisFilters + ''''
												) 
												SELECT * FROM MyListTable
												INNER JOIN MyAnalysisTable ON MyListTable.list_id = MyAnalysisTable.analysis_list_id AND MyListTable.list_location_id = MyAnalysisTable.location_id 
												WHERE 1=1 ''''+@Filters+''''
												ORDER BY ''''+ @OrderByColumn + '''' ''''+ @Order 
							IF @RowsOfPage > 0 AND @PageNumber > 0
								SET @SQL = @SQL +'''' OFFSET (@PageNumber-1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY'''';
							--PRINT @SQL  
							-- MyListTable.[Location Name]

							SET @SQL = REPLACE(@SQL, ''''{TEMPLATE_ID}'''', @template_id);
							SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listID);	
							SET @SQL = REPLACE(@SQL, ''''{LOCATION_COLUMNS}'''', @list_location_table_cols_output);
							SET @SQL = REPLACE(@SQL, ''''{LOCATION_TABLE}'''', @listLocationTableName);
							SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_COLUMNS}'''', @analysis_location_table_cols_output);
							SET @SQL = REPLACE(@SQL, ''''{ANALYSIS_TABLE}'''', @listAnalysisTableName);

							
							EXEC sp_executesql @SQL, 
									N''''@PageNumber INT, @RowsOfPage INT, @OrderByColumn NVARCHAR(MAX), @Order NVARCHAR(5), @Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaMin INT, @AnalysisAreaMax INT,@selectedSupplier NVARCHAR(150),@selectedSecondSupplier NVARCHAR(150),@selectedParentCompany NVARCHAR(150),@showRSPOCertified BIT,@selectedOverallThreats NVARCHAR(150),@selectedOverallValues NVARCHAR(150),@selectedMillPriority NVARCHAR(150)'''',
									@PageNumber=@PageNumber, @RowsOfPage=@RowsOfPage, @OrderByColumn=@OrderByColumn, @Order=@Order, @Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaMin=@AnalysisAreaMin, @AnalysisAreaMax=@AnalysisAreaMax,@selectedSupplier=@selectedSupplier,@selectedSecondSupplier=@selectedSecondSupplier,@selectedParentCompany=@selectedParentCompany,@showRSPOCertified=@showRSPOCertified,@selectedOverallThreats=@selectedOverallThreats,@selectedOverallValues=@selectedOverallValues,@selectedMillPriority=@selectedMillPriority;

						END

				'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		EXEC sp_executesql @SQL

		/********************************************************
		* ADD THE INITIAL DATA INTO THE DATABASE.
		********************************************************/
		-- Insert SharingStatuses into SharingStatuses Table
		SET @TEMPLATE = 'INSERT INTO [{DATABASENAME}].dbo.SharingStatuses(sharing_status) VALUES (''Pending'')
						 INSERT INTO [{DATABASENAME}].dbo.SharingStatuses(sharing_status) VALUES (''Active'')'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		SET @SQL = REPLACE(@SQL, '{ACCOUNTID}', @PendingAccountID)
		EXEC sp_executesql @SQL

		-- Create an Admin Account for the Manager.
		SET @TEMPLATE = 'INSERT INTO [{DATABASENAME}].dbo.Users(first_name, middle_initial, last_name, email, phone, title_id, other_title,
			 access_level_id, status_id, is_system_user, email_subscription, activated_time,
			 viirs_email_frequency, glad_email_frequency, forma_email_frequency, terrai_email_frequency, gran_chaco_email_frequency)
			 SELECT first_name, middle_initial, last_name, email, phone,
			 title_id, other_title, access_level_id, 2, 0, email_subscription, ''{ACTIVATEDTIME}'' AS activated_time, 0, 0, 0, 0, 0
			 FROM PendingAccountsUsers WHERE pendingaccounts_id = {ACCOUNTID}'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		SET @SQL = REPLACE(@SQL, '{ACCOUNTID}', @PendingAccountID)
		SET @SQL = REPLACE(@SQL, '{ACTIVATEDTIME}', @ActivatedTime)
		EXEC sp_executesql @SQL

		-- Obtain the User ID.
		DECLARE @managerID INT
		SET @managerID = 1		--Will always be the first id.

		--Insert the Organization Info into the new Database.
		SET @TEMPLATE = 'INSERT INTO [{DATABASENAME}].dbo.AccountProfile(organization_name, organization_address,
						 organization_website, organization_is_subsidiary, organization_parent, manager_user_id)
						 SELECT organization_name, organization_address, organization_website, organization_is_subsidiary,
						 organization_parent, {MANAGER_ID} FROM PendingAccounts WHERE id = {ACCOUNTID}'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		SET @SQL = REPLACE(@SQL, '{MANAGER_ID}', @managerID)
		SET @SQL = REPLACE(@SQL, '{ACCOUNTID}', @PendingAccountID)
		EXEC sp_executesql @SQL

		--Insert the Organization Classifications.
		SET @TEMPLATE = 'INSERT INTO [{DATABASENAME}].dbo.AccountClassifications(classification_id)
						 SELECT classification_id FROM PendingAccountsClassifications WHERE pendingaccounts_id = {ACCOUNTID}'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		SET @SQL = REPLACE(@SQL, '{ACCOUNTID}', @PendingAccountID)
		EXEC sp_executesql @SQL

		--Insert the Manager Commodities.
		SET @TEMPLATE = 'INSERT INTO [{DATABASENAME}].dbo.UserCommodities(user_id, commodity_id)
						 SELECT {MANAGER_ID}, commodity_id FROM PendingAccountsUsersCommodities WHERE pendingaccountsuser_id = {PENDINGACCOUNTUSERID}'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		SET @SQL = REPLACE(@SQL, '{MANAGER_ID}', @managerID)
		SET @SQL = REPLACE(@SQL, '{PENDINGACCOUNTUSERID}', @pendingAccountManagerID)
		EXEC sp_executesql @SQL

		--Insert the Manager Geographies.
		SET @TEMPLATE = 'INSERT INTO [{DATABASENAME}].dbo.UserGeographies(user_id, geography_id)
						 SELECT {MANAGER_ID}, geography_id FROM PendingAccountsUsersGeographies WHERE pendingaccountsuser_id = {PENDINGACCOUNTUSERID}'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		SET @SQL = REPLACE(@SQL, '{MANAGER_ID}', @managerID)
		SET @SQL = REPLACE(@SQL, '{PENDINGACCOUNTUSERID}', @pendingAccountManagerID)
		EXEC sp_executesql @SQL

		--Insert the Manager Policies.
		SET @TEMPLATE = 'INSERT INTO [{DATABASENAME}].dbo.Policies(document_name)
						 SELECT document_name FROM PendingAccountsPolicies WHERE organization_id = {ACCOUNTID}'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		SET @SQL = REPLACE(@SQL, '{ACCOUNTID}', @PendingAccountID)
		EXEC sp_executesql @SQL

		-- Add Data to the main list of Organizations. (Assuming 2 = Active)
		INSERT INTO dbo.Organizations ([id]
           ,[organization_name]
           ,[organization_db]
           ,[organization_status_id]
           ,[organization_activated_time]
		)
		VALUES(@PendingAccountID, @OrgName, @OrgdbName, 2, @ActivatedTime)

		--Get New Organization ID.
		DECLARE @orgID INT
		SET @orgID = @PendingAccountID

		-- Add User Data to the main Route Table. (Assuming 2 = Pending)
		INSERT INTO UserRoutes(user_email, organization_id, organization_user_id, organization_user_status_id)
		VALUES (@pendingAccountManagerEmail, @orgID, @managerID, 2)

		-- Add Data to the User Secrets Table, if the user does not already exist.
		DECLARE @uCount INT
		DECLARE @userExists INT
		SET @userExists = 0
		SELECT @uCount = COUNT(*) FROM UserSecrets WHERE user_email = @pendingAccountManagerEmail
		IF @uCount = 0
		BEGIN
			--User does not already exist, so create secrets for the user.  authentication preference to be 0 - email
			INSERT INTO UserSecrets(user_email, user_secret, user_auth_preference_id) VALUES(@pendingAccountManagerEmail, @UserSecret, 0)
		END
		ELSE
		BEGIN
			-- Mark that the user already exists so that a Cognito user is not created.
			SET @userExists = 1
		END

		-- Create System Admin Accounts for the WRI Root Users.
		SET @TEMPLATE = '
			DECLARE @first_name NVARCHAR(35),
					@middle_initial NVARCHAR(2),
					@last_name NVARCHAR(35),
					@email NVARCHAR(50),
					@phone VARCHAR(50),
					@title_id INT,
					@other_title NVARCHAR(150),
					@access_level_id INT,
					@status_id INT,
					@isSystemUser BIT,
					@emailSubscribe BIT,
					@activated_time SMALLDATETIME

			SET @access_level_id = 1
			SET @isSystemUser = 1
			SET @emailSubscribe = 0
			SET @activated_time = GETDATE()

			DECLARE user_cursor CURSOR FOR
			SELECT first_name, middle_initial, last_name, user_email, phone, user_status_id, title_id, other_title
			FROM GFWProRootUserRoutes

			-- Loop Through each pending account and create compiled data.
			OPEN user_cursor
			FETCH NEXT FROM user_cursor
			INTO @first_name, @middle_initial, @last_name, @email, @phone, @status_id, @title_id, @other_title
			WHILE  @@FETCH_STATUS = 0
			BEGIN
				DECLARE @userAdded INT
				SELECT @userAdded = COUNT(*) FROM [{DATABASENAME}].dbo.Users WHERE email = @email

				IF @userAdded = 0
				BEGIN
					-- Insert WRI Root User as System user into organization.
					INSERT INTO [{DATABASENAME}].dbo.Users(email, first_name, middle_initial, last_name, phone, status_id, activated_time, title_id, other_title, email_subscription, access_level_id, is_system_user,
					viirs_email_frequency, glad_email_frequency, forma_email_frequency, terrai_email_frequency, gran_chaco_email_frequency)
					VALUES(@email, @first_name, @middle_initial, @last_name, @phone, @status_id, @activated_time, @title_id, @other_title, @emailSubscribe, @access_level_id, @isSystemUser, 0, 0, 0, 0, 0)

					-- Get ID Of User entered, to add to main platform user routes.
					DECLARE @userDBID INT
					SET @userDBID = SCOPE_IDENTITY()

					-- Create a new entry into the User Routes Table.
					INSERT INTO UserRoutes(user_email, organization_id, organization_user_id, organization_user_status_id)
					VALUES (@email, {OrganizationID}, @userDBID, 2)
				END
				FETCH NEXT FROM user_cursor
				INTO @first_name, @middle_initial, @last_name, @email, @phone, @status_id, @title_id, @other_title
			END
			CLOSE user_cursor
			DEALLOCATE user_cursor'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
		SET @SQL = REPLACE(@SQL, '{OrganizationID}', @orgID)
		EXEC sp_executesql @SQL

		-- Return email and organization name back for sending emails.
		SELECT @pendingAccountManagerEmail AS ManagerEmail, @OrgName AS OrganizationName,
		@pendingAccountManagerFirstName AS FirstName, @pendingAccountManagerLastName AS LastName, @userExists AS UserExists, @orgID AS orgID

	END TRY
	BEGIN CATCH
		SET @ErrorMessage  = ERROR_MESSAGE()
		SET @ErrorSeverity = ERROR_SEVERITY()
		SET @ErrorState    = ERROR_STATE()
		RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState)
	END CATCH
