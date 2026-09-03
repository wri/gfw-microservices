/**
 * @param PendingAccountID INT,
 * @param UserSecret VARCHAR(50),
 * @param ActivatedTime SMALLDATETIME
 */
export const activatePendingAccount = `
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

    -- Drop any leftover database from a previous failed activation attempt.
    IF DB_ID(@OrgdbName) IS NOT NULL
    BEGIN
        -- Safety check: refuse to drop if an active organization already owns this database.
        IF EXISTS (SELECT 1 FROM Organizations WHERE organization_db = @OrgdbName)
            RAISERROR('Cannot activate: database %s is already assigned to an existing organization.', 16, 1, @OrgdbName)
        ELSE
        BEGIN
            SET @SQL =
                N'ALTER DATABASE ' + QUOTENAME(@OrgdbName) +
                N' SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE ' + QUOTENAME(@OrgdbName)
            EXEC sp_executesql @SQL
        END
    END

    SET @SQL =
        N'CREATE DATABASE ' + QUOTENAME(@OrgdbName) +
        N'; ALTER DATABASE ' + QUOTENAME(@OrgdbName) + N' SET RECOVERY SIMPLE;'
    EXEC sp_executesql @SQL

    /********************************************************
   * CREATE ALL THE TABLES.
   ********************************************************/
    SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[ListsUploadStatus]
    (
        [id] INT IDENTITY(1, 1) NOT NULL,
        [list_id] INT,
        [last_successful_stage] NVARCHAR(128) DEFAULT ''{}'',
        [error_info] NVARCHAR(512) DEFAULT ''{}'',
        [update_time] DATETIME,
        [worker_instance_id] NVARCHAR(128) DEFAULT ''{}'',
        CONSTRAINT [PK_ListsUploadStatus] PRIMARY KEY CLUSTERED(id)
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
        [country] NVARCHAR(100) NULL,
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
        [deactivation_date] SMALLDATETIME NULL,
        [country] NVARCHAR(100) NULL,
        [language] NCHAR(2) NULL,
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
        [vector_tiles_last_updated] DATETIME2 NULL,
  [version] INT NOT NULL DEFAULT 0,
  [Commodity] NVARCHAR(150) NULL,

        INDEX [IX_Lists_1] NONCLUSTERED(list_name, list_table_name, list_analysis_table_name),
        INDEX [IX_Lists_2] NONCLUSTERED(list_table_name),
        CONSTRAINT [PK_Lists] PRIMARY KEY CLUSTERED(id)
    )'
    SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
    EXEC sp_executesql @SQL

SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[ListAttributes]
    (
  [list_id] INT NOT NULL,
  [attribute_name] NVARCHAR(64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [attribute_type] INT NOT NULL,
  CONSTRAINT [PK_ListAttributes] PRIMARY KEY ([list_id],[attribute_name])
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
        [location_error] NVARCHAR(MAX) NULL,
        [glad_alerts_coverage] NVARCHAR(MAX) NULL,
        [glad_alerts_daily] NVARCHAR(MAX) NULL,
        [glad_alerts_weekly] NVARCHAR(MAX) NULL,
        [glad_alerts_monthly] NVARCHAR(MAX) NULL,
        [viirs_alerts_daily] NVARCHAR(MAX) NULL,
        [tree_cover_extent_total] DECIMAL(18, 6) NULL,
        [integrated_alerts_coverage] NVARCHAR(MAX) DEFAULT ''{}'',
        [total_ha] FLOAT NULL,
        [intdist_alerts_area_sbtn_natural_forests_nominal] NVARCHAR(MAX) DEFAULT ''{}'',
        [intdist_alerts_area_sbtn_natural_forests_high] NVARCHAR(MAX) DEFAULT ''{}'',
        [intdist_alerts_area_sbtn_natural_forests_highest] NVARCHAR(MAX) DEFAULT ''{}'',
        [intdist_alerts_area_sbtn_natural_ecosystem_nominal] NVARCHAR(MAX) DEFAULT ''{}'',
        [intdist_alerts_area_sbtn_natural_ecosystem_high] NVARCHAR(MAX) DEFAULT ''{}'',
        [intdist_alerts_area_sbtn_natural_ecosystem_highest] NVARCHAR(MAX) DEFAULT ''{}'',
        [intdist_alerts_area_jrc_nominal] NVARCHAR(MAX) DEFAULT ''{}'',
        [intdist_alerts_area_jrc_high] NVARCHAR(MAX) DEFAULT ''{}'',
        [intdist_alerts_area_jrc_highest] NVARCHAR(MAX) DEFAULT ''{}'',
        [intdist_alerts_area_all_nominal] NVARCHAR(MAX) DEFAULT ''{}'',
        [intdist_alerts_area_all_high] NVARCHAR(MAX) DEFAULT ''{}'',
        [intdist_alerts_area_all_highest] NVARCHAR(MAX) DEFAULT ''{}'',
        [status_code] INT NULL,

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

        [protected_areas_by_category_area] NVARCHAR(MAX) DEFAULT ''{}'',
        [landmark_by_category_area] NVARCHAR(MAX) DEFAULT ''{}'',

        [country_specific_deforestation_yearly] NVARCHAR(MAX),
        [country_specific_deforestation_wdpa_yearly] NVARCHAR(MAX),
        [country_specific_deforestation_landmark_yearly] NVARCHAR(MAX),
        [country_specific_deforestation_classified_region_yearly] NVARCHAR(MAX),
        [tree_cover_loss_by_country_yearly] NVARCHAR(MAX),
        [tree_cover_loss_by_country_wdpa_yearly] NVARCHAR(MAX),
        [tree_cover_loss_by_country_landmark_yearly] NVARCHAR(MAX),

        [country_area] NVARCHAR(MAX),
        [classified_region_area] NVARCHAR(MAX),
        [tree_cover_loss_by_country_classified_region_yearly] NVARCHAR(MAX),

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
  [options] NVARCHAR(32) NULL,
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
    )
    CREATE NONCLUSTERED INDEX IX_ListId_AnalysisType_StartTime
    ON [{DATABASENAME}].[dbo].[ListsProcessing] (list_id, analysis_type, analysis_start_time);
    ';

    SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
    EXEC sp_executesql @SQL

    SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[AFIAnalysis](
        [list_id] [INT] NULL,
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
        [natural_forest_loss_by_year] [NVARCHAR](MAX) NULL DEFAULT ''{}'',
        [protected_areas_area] [decimal] (18, 6) NULL,
        [landmark_area] [decimal] (18, 6) NULL,

        INDEX [IX_AFIAnalysis_location_id] NONCLUSTERED ([location_id] ASC),
        INDEX [IX_AFIAnalysis_gadm_id] NONCLUSTERED ([gadm_id] ASC),
        INDEX [IX_AFIAnalysis_list_id] NONCLUSTERED ([list_id] ASC)
    )'
    SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
    EXEC sp_executesql @SQL

    SET @TEMPLATE = 'CREATE TABLE [{DATABASENAME}].[dbo].[GHGAnalyses] (
        [list_id] INT NOT NULL,
        [location_id] INT NOT NULL,
        [total_area_ha] FLOAT,
        [status_code] SMALLINT,
        [location_error] NVARCHAR (MAX),
        [emissions_factor_by_year] NVARCHAR (MAX),
        [ef_co2_by_year] NVARCHAR(MAX),
        [ef_ch4_by_year] NVARCHAR(MAX),
        [ef_n2o_by_year] NVARCHAR(MAX),
        [emissions_co2_yearly] NVARCHAR(MAX) NULL,
        [emissions_ch4_yearly] NVARCHAR(MAX) NULL,
        [emissions_n2o_yearly] NVARCHAR(MAX) NULL,
        [emissions_yearly] NVARCHAR(MAX) NULL,
        [production] FLOAT NULL,
        [weighted_avg_yield] FLOAT NULL,
        CONSTRAINT [PK_GHGAnalyses] PRIMARY KEY ([list_id], [location_id]),

        INDEX [IDX_GHGAnalyses_ListID] NONCLUSTERED ([list_id] ASC)
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
                [location_error] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
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
        viirs_email_frequency, glad_email_frequency, forma_email_frequency, terrai_email_frequency, gran_chaco_email_frequency,
        country, language)
        SELECT pau.first_name, pau.middle_initial, pau.last_name, pau.email, pau.phone,
        pau.title_id, pau.other_title, pau.access_level_id, 2, 0, pau.email_subscription, ''{ACTIVATEDTIME}'' AS activated_time, 0, 0, 0, 0, 0,
        CASE WHEN NULLIF(LTRIM(RTRIM(pa.organization_country)), '''') IS NULL OR UPPER(LTRIM(RTRIM(pa.organization_country))) = ''NULL'' THEN NULL ELSE LTRIM(RTRIM(pa.organization_country)) END,
        CASE
            WHEN NULLIF(LTRIM(RTRIM(pa.organization_country)), '''') IS NOT NULL AND UPPER(LTRIM(RTRIM(pa.organization_country))) <> ''NULL'' AND UPPER(LTRIM(RTRIM(pa.organization_country))) IN (''ARGENTINA'',''BOLIVIA'',''CHILE'',''COLOMBIA'',''COSTA RICA'',''CUBA'',''DOMINICAN REPUBLIC'',''ECUADOR'',''EL SALVADOR'',''EQUATORIAL GUINEA'',''GUATEMALA'',''HONDURAS'',''MEXICO'',''NICARAGUA'',''PANAMA'',''PARAGUAY'',''PERU'',''SPAIN'',''URUGUAY'',''VENEZUELA'',''ANDORRA'',''VATICAN CITY'') THEN ''ES''
            WHEN NULLIF(LTRIM(RTRIM(pa.organization_country)), '''') IS NOT NULL AND UPPER(LTRIM(RTRIM(pa.organization_country))) <> ''NULL'' AND UPPER(LTRIM(RTRIM(pa.organization_country))) IN (''ANGOLA'',''BRAZIL'',''CABO VERDE'',''GUINEA-BISSAU'',''MOZAMBIQUE'',''PORTUGAL'',''SAO TOME AND PRINCIPE'',''TIMOR-LESTE'') THEN ''PT''
            WHEN NULLIF(LTRIM(RTRIM(pa.organization_country)), '''') IS NOT NULL AND UPPER(LTRIM(RTRIM(pa.organization_country))) <> ''NULL'' THEN ''EN''
            ELSE NULL
        END
        FROM PendingAccountsUsers pau
        JOIN PendingAccounts pa ON pa.id = pau.pendingaccounts_id
        WHERE pau.pendingaccounts_id = {ACCOUNTID}'
    SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
    SET @SQL = REPLACE(@SQL, '{ACCOUNTID}', @PendingAccountID)
    SET @SQL = REPLACE(@SQL, '{ACTIVATEDTIME}', @ActivatedTime)
    EXEC sp_executesql @SQL

    -- Obtain the User ID.
    DECLARE @managerID INT
    SET @managerID = 1        --Will always be the first id.

    --Insert the Organization Info into the new Database.
    SET @TEMPLATE = 'INSERT INTO [{DATABASENAME}].dbo.AccountProfile(organization_name, organization_address,
                    organization_website, organization_is_subsidiary, organization_parent, manager_user_id, country)
                    SELECT organization_name, organization_address, organization_website, organization_is_subsidiary,
                    organization_parent, {MANAGER_ID}, NULLIF(LTRIM(RTRIM(organization_country)), '''')
                    FROM PendingAccounts WHERE id = {ACCOUNTID}'
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
        WHERE has_customer_access = 1;

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
`;
