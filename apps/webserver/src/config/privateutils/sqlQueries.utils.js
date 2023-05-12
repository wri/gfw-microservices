/**
 *******************************************************************
 *   @name: sqlQueries.utils.js
 *   @description : Returns SQL query strings using identifiers that used to be stored procedures
 */

const config = require('../config');

// Verify given connection is for system (gfwpro) DB
const verifySystemDB = (connectConfig) => {
  if (connectConfig.database !== config.SQLConnection.database) {
    throw new Error(`verifySystemDB failed ${connectConfig.database}`);
  }
};

// Verify given connection is not for system (gfwpro) DB, but for organization (clientstore-<xxx>) DB
const verifyOrgDB = (connectConfig) => {
  if (connectConfig.database === config.SQLConnection.database) {
    throw new Error(`verifyOrgDB failed ${connectConfig.database}`);
  }
};

/**
 * System (gfwpro) DB queries below this line just to keep them separate and easier to find
 * ----------------------------------------------------------------------------------------
 */
const uspGetClassificationsQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return 'SELECT * from Classifications ORDER BY classification_name';
};

const uspGetAccessLevelsQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return 'SELECT * from AccessLevels ORDER BY accesslevel_name';
};

const uspGetCommoditiesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return 'SELECT * from Commodities ORDER BY commmodity_name';
};

const uspGetTitlesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return 'SELECT * from Titles ORDER BY title';
};

const uspGetActivityTypesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return `SELECT AT.id AS [ActivityTypeID], AT.activity_type_category_id AS [ActivityCategoryID],
    AC.activity_type_category_name AS [ActivityCategoryName], AT.activity_type_name AS [ActivityTypeName]
    FROM ActivityType AT
    JOIN ActivityTypeCategory AC ON AT.activity_type_category_id = AC.id`;
};

const uspGetAdministrativeAreasInfoQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return `SELECT DISTINCT Country, State, [Sub State]
	  FROM [list-administrativeAreas]`;
};

const uspGetStatusesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return 'SELECT * from Statuses ORDER BY status_name';
};

const uspGetGeographiesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return 'SELECT * from Geographies ORDER BY geography_name';
};

const uspGetProtectedAreasInfoQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return `SELECT DISTINCT [Location Name], [IUCN CAT], [Designation Type], Designation, Country, State, [Sub State]
	  FROM [list-protectedAreas]`;
};

const uspGetInitialUserRouteInfoQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return `SELECT UR.user_email, US.user_secret, US.user_auth_preference_id
    FROM UserRoutes UR LEFT JOIN UserSecrets US ON UR.user_email = US.user_email
    WHERE UR.user_email = @userEmail AND UR.organization_user_status_id <> 3`;
};

const uspGetGFWProRootUserInfoQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return `SELECT GUR.user_email, US.user_secret, US.user_auth_preference_id
    FROM [GFWProRootUserRoutes] GUR LEFT JOIN UserSecrets US ON GUR.user_email = US.user_email
    WHERE GUR.user_email = @userEmail  AND GUR.user_status_id <> 3`;
};

const uspGetVerifiedUserRouteInfoQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return `SELECT UR.user_email, US.user_secret, UR.organization_id, UR.organization_user_id,
    UR.organization_user_status_id, OG.organization_name, OG.organization_db, OG.organization_status_id, OG.subscription_status_id
    FROM UserRoutes UR LEFT JOIN UserSecrets US ON UR.user_email = US.user_email
    LEFT JOIN Organizations OG ON UR.organization_id = OG.id
    WHERE UR.user_email = @userEmail AND UR.organization_user_status_id <> 3`;
};

const uspGetOrganizationStatusQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return 'SELECT organization_status_id, subscription_status_id FROM Organizations WHERE id = @organizationId';
};

const uspGetTemplateMetadataQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return `SELECT
      TM.id,
      TM.template_id,
      TM.template_datum_field_name,
      TM.template_datum_field_description,
      TM.template_datum_type_id,
      TM.template_datum_mandatory,
      TM.template_datum_system,
      UT.ui_type,
      T.location_type_id,
      T.template_name,
      LT.location_type_name
    FROM TemplateMetadata TM
    LEFT JOIN UITypes UT on TM.template_datum_ui_id = UT.id
    LEFT JOIN Templates T ON TM.template_id = T.id
    LEFT JOIN LocationType LT ON T.location_type_id = LT.id`;
};

const uspGetTemplatesDropdownQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return 'SELECT * FROM TemplateDropdowns';
};

const uspGetUserAuthenticationPreferencesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return `SELECT US.user_email, user_auth_preference_id AS auth_preference_id
    FROM UserRoutes AS UR
    JOIN UserSecrets AS US on US.user_email = UR.user_email
    WHERE UR.organization_id = @organization_id AND UR.user_email = @user_email`;
};

const uspGetUsersAuthenticationPreferencesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return `SELECT US.user_email, user_auth_preference_id AS auth_preference_id
    FROM UserRoutes AS UR
    JOIN UserSecrets AS US on US.user_email = UR.user_email
    WHERE UR.organization_id = @organization_id`;
};

const uspGetLocationsCountQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return `DECLARE @organization_db NVARCHAR(200)
    DECLARE @TEMPLATE NVARCHAR(1000)
    DECLARE @SQL NVARCHAR(2000)

    SET @organization_db = @org_db

    SET @TEMPLATE = '
      DECLARE @totalCount INT
      DECLARE @investmentCount INT
      DECLARE @commodityCount INT

      --Get the Total Count of all Lists.
      SELECT @totalCount = SUM(L.list_locations_count)
      FROM [{DATABASENAME}].dbo.Lists AS L
      JOIN Templates AS T ON L.template_id = T.id
      JOIN LocationType LT ON T.location_type_id = LT.id

      --Get the Investment Count of all Lists.
      SELECT @investmentCount = SUM(L.list_locations_count)
      FROM [{DATABASENAME}].dbo.Lists AS L
      JOIN Templates AS T ON L.template_id = T.id
      JOIN LocationType LT ON T.location_type_id = LT.id
      WHERE T.location_type_id = 1

      --Get the Total Count of all Lists.
      SELECT @commodityCount = SUM(L.list_locations_count)
      FROM [{DATABASENAME}].dbo.Lists AS L
      JOIN Templates AS T ON L.template_id = T.id
      JOIN LocationType LT ON T.location_type_id = LT.id
      WHERE T.location_type_id = 2

      SELECT @totalCount AS TotalCount, @investmentCount AS InvestmentCount, @commodityCount AS CommodityCount
    '
    SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @organization_db)
    EXEC sp_executesql @SQL`;
};

const uspGetGfwListsQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return 'SELECT * FROM GFWLists';
};

/**
 * Organization queries below this line just to keep them separate and easier to find
 * ----------------------------------------------------------------------------------
 */

const uspSetActivityLogQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return `INSERT INTO ActivityLog([user_id], activity_type_id, activity_description, activity_time)
	  VALUES(@userID, @activityTypeID, @activityDescription, @activityTime)`;
};

const uspGetUserInfoQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return `DECLARE @arrCommodities NVARCHAR(100)
    SELECT @arrCommodities = COALESCE(@arrCommodities + ',', '') + CONVERT(varchar(3), commodity_id)
    FROM UserCommodities WHERE user_id = @userID

    -- Obtain User Geographies Info.
    DECLARE @arrGeographies NVARCHAR(100)
    SELECT @arrGeographies = COALESCE(@arrGeographies + ',', '') + CONVERT(varchar(3), geography_id)
    FROM UserGeographies WHERE user_id = @userID

    SELECT id, first_name, middle_initial, last_name, email, phone, title_id, other_title, access_level_id, status_id, email_subscription,
    @arrCommodities AS user_commodity_ids, @arrGeographies AS user_geography_ids,
    viirs_email_frequency, glad_email_frequency, forma_email_frequency, terrai_email_frequency, gran_chaco_email_frequency
    FROM Users WHERE id = @userID`;
};

const uspGetUserStatusQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return 'SELECT status_id FROM Users WHERE id = @user_id';
};

const uspGetAllListsQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return `SELECT  L.*, LL.large_list_id
    FROM Lists L
    LEFT JOIN LargeLists LL ON L.id=LL.list_id
    ORDER BY list_name`;
};

const uspGetUsersListQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return `-- Create a Table Variable to store the compiled user data  for the company.
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
      SELECT @arrCommodities = COALESCE(@arrCommodities + ',', '') + CONVERT(varchar(3), commodity_id)
      FROM UserCommodities WHERE [user_id] = @userID

      -- Obtain User Geographies Info.
      DECLARE @arrGeographies NVARCHAR(100)
      SELECT @arrGeographies = COALESCE(@arrGeographies + ',', '') + CONVERT(varchar(3), geography_id)
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

    SELECT * FROM @CompiledUsers`;
};

const uspGetUserInternalShareListsQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return `SELECT * FROM InternalShareRoutes
    WHERE
      admin_id = @user_id or
      user_id = @user_id`;
};

const uspGetFoldersQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return `DECLARE @SQL NVARCHAR(1000)
    BEGIN
      SET @SQL = 'SELECT id, name, last_accessed_at, created_at FROM [dbo].[Folders] WHERE user_id = {USER_ID}'
      SET @SQL = REPLACE(@SQL, '{USER_ID}', @user_id)
      EXEC sp_executesql @SQL
    END`;
};

const uspGetAllFolderItemsQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return `DECLARE @SQL NVARCHAR(1000)
    BEGIN
      SET @SQL = 'SELECT * FROM [dbo].[FolderItems] WHERE folder_id IN (SELECT id FROM [dbo].[Folders] WHERE USER_ID = {USER_ID});'
      SET @SQL = REPLACE(@SQL, '{USER_ID}', @user_id)
      EXEC sp_executesql @SQL
    END`;
};

const convertedStoredProcedures = {
  // systemDB
  uspGetClassifications: uspGetClassificationsQuery,
  uspGetAccessLevels: uspGetAccessLevelsQuery,
  uspGetCommodities: uspGetCommoditiesQuery,
  uspGetTitles: uspGetTitlesQuery,
  uspGetActivityTypes: uspGetActivityTypesQuery,
  uspGetAdministrativeAreasInfo: uspGetAdministrativeAreasInfoQuery,
  uspGetStatuses: uspGetStatusesQuery,
  uspGetGeographies: uspGetGeographiesQuery,
  uspGetProtectedAreasInfo: uspGetProtectedAreasInfoQuery,
  uspGetInitialUserRouteInfo: uspGetInitialUserRouteInfoQuery,
  uspGetGFWProRootUserInfo: uspGetGFWProRootUserInfoQuery,
  uspGetVerifiedUserRouteInfo: uspGetVerifiedUserRouteInfoQuery,
  uspGetOrganizationStatus: uspGetOrganizationStatusQuery,
  uspGetTemplateMetadata: uspGetTemplateMetadataQuery,
  uspGetTemplatesDropdown: uspGetTemplatesDropdownQuery,
  uspGetUserAuthenticationPreferences: uspGetUserAuthenticationPreferencesQuery,
  uspGetUsersAuthenticationPreferences: uspGetUsersAuthenticationPreferencesQuery,
  uspGetLocationsCount: uspGetLocationsCountQuery,
  uspGetGfwLists: uspGetGfwListsQuery,

  // orgDB
  uspSetActivityLog: uspSetActivityLogQuery,
  uspGetUserInfo: uspGetUserInfoQuery,
  uspGetUserStatus: uspGetUserStatusQuery,
  uspGetAllLists: uspGetAllListsQuery,
  uspGetUsersList: uspGetUsersListQuery,
  uspGetUserInternalShareLists: uspGetUserInternalShareListsQuery,
  uspGetFolders: uspGetFoldersQuery,
  uspGetAllFolderItems: uspGetAllFolderItemsQuery,
};

const getQueryStr = async (connectConfig, storedProcedureName, params) => {
  const queryFn = convertedStoredProcedures[storedProcedureName];
  if (queryFn) {
    const baseQuery = queryFn(connectConfig, params);
    // add defaults for MSSQL -- TODO: parameterize for other DBMSs later
    return `SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; ${baseQuery}`;
  }
  return null;
};

module.exports = {
  getQueryStr,
};
