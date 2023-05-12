
INSERT INTO [gfwpro].[dbo].[ActivityType] (activity_type_category_id, activity_type_name) VALUES(4, 'ListShared'), (4, 'ListUnShared'), (4, 'ListUnSharedWithAll')

GO

ALTER PROCEDURE dbo.uspGetAllUsersList
AS
	-- Create a Table Variable to store the compiled pending accounts data in.
	DECLARE @CompiledPendingAccounts TABLE
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
		[user_activated_time] SMALLDATETIME NULL,
		[user_id] INT NULL
	)

	/************************************************************
	* FIRST: ADD INFO FROM ALL REQUESTED/PENDING USERS
	************************************************************/
	-- Setup a new cursor to go through each pending account.
	DECLARE @organization_id INT,
					@organization_name NVARCHAR(200)
	DECLARE user_cursor CURSOR FOR

	SELECT id, organization_name
	FROM PendingAccounts

	-- Loop Through each pending account and create compiled data.
	OPEN user_cursor
	FETCH NEXT FROM user_cursor
	INTO @organization_id, @organization_name
	WHILE  @@FETCH_STATUS = 0
	BEGIN
		-- Obtain User Information.
		DECLARE @userid INT
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
		SELECT @userid = id, @first_name = first_name, @middle_initial = middle_initial,
		@last_name = last_name, @email = email, @phone = phone, @title_id = title_id, @other_title = other_title,
		@access_level_id = access_level_id, @status_id = status_id,
		@email_subscription = email_subscription
		FROM PendingAccountsUsers WHERE pendingaccounts_id = @organization_id

		--There are no alerts for pending users, set to 0.
		SET @viirsEmailFrequency = 0
		SET @gladEmailFrequency = 0
		SET @formaEmailFrequency = 0
		SET @terraiEmailFrequency = 0
		SET @granChacoEmailFrequency = 0

		-- Obtain User Commodities Info.
		DECLARE @arrCommodities NVARCHAR(100)
		SELECT @arrCommodities = COALESCE(@arrCommodities + ',', '') + CONVERT(varchar(3), commodity_id)
		FROM PendingAccountsUsersCommodities WHERE pendingaccountsuser_id = @userid

		-- Obtain User Geographies Info.
		DECLARE @arrGeographies NVARCHAR(100)
		SELECT @arrGeographies = COALESCE(@arrGeographies + ',', '') + CONVERT(varchar(3), geography_id)
		FROM PendingAccountsUsersGeographies WHERE pendingaccountsuser_id = @userid

		-- Obtain Status Level from Id.
		SELECT @status_level = status_name FROM Statuses WHERE id = @status_id

		-- Obtain Access Level from Id.
		SELECT @access_level = accesslevel_name FROM AccessLevels WHERE id = @access_level_id

		-- Set Auth Preference.
		SET @auth_preference_id = 0

		-- Insert Row with data into compiled table.
		INSERT INTO @CompiledPendingAccounts
		VALUES(@organization_id, @organization_name, @first_name, @middle_initial,
				@last_name, @email, @phone, @title_id, @other_title, @access_level_id, @arrCommodities,
				@arrGeographies, @email_subscription, @viirsEmailFrequency, @gladEmailFrequency,
				@formaEmailFrequency, @terraiEmailFrequency, @granChacoEmailFrequency,
				@auth_preference_id, @status_id, NULL, @userid)

		-- Fetch Next Row.
		FETCH NEXT FROM user_cursor
		INTO @organization_id, @organization_name

		--Reset arrays for next pass.
		SET @arrCommodities = NULL
		SET @arrGeographies = NULL
	END
	CLOSE user_cursor
	DEALLOCATE user_cursor

	/************************************************************
	* NEXT: ADD INFO FROM ALL USERS IN ALREADY CREATED ACCOUNTS
	************************************************************/
	-- Setup a new cursor to go through each created account.
	DECLARE @organization_db NVARCHAR(200)
	DECLARE @organization_status_id INT
	DECLARE @TEMPLATE NVARCHAR(1000)
	DECLARE @SQL NVARCHAR(1000)
	DECLARE org_cursor CURSOR FOR
	SELECT
	id, organization_name, organization_db, organization_status_id FROM Organizations

	-- Loop Through each organization and create compiled data.
	OPEN org_cursor
	FETCH NEXT FROM org_cursor
	INTO @organization_id, @organization_name, @organization_db, @organization_status_id
	WHILE  @@FETCH_STATUS = 0
	BEGIN
		-- Setup SQL Query to get data from database.
		SET @TEMPLATE = 'EXEC [{DATABASENAME}].[dbo].[uspGetAllUsersInfo] {ORGID}, [''{ORGNAME}'']'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @organization_db)
		SET @SQL = REPLACE(@SQL, '{ORGID}', @organization_id)
		SET @SQL = REPLACE(@SQL, '{ORGNAME}', @organization_name)

		-- Insert Row with data into compiled table.
		--SELECT @SQL
		INSERT INTO @CompiledPendingAccounts EXEC sp_executesql @SQL

		-- Fetch Next Row.
		FETCH NEXT FROM org_cursor
		INTO @organization_id, @organization_name, @organization_db, @organization_status_id
	END
	CLOSE org_cursor
	DEALLOCATE org_cursor

	SELECT * FROM @CompiledPendingAccounts
GO


ALTER TABLE Organizations
ALTER COLUMN organization_name nvarchar(200);

GO

ALTER TABLE Organizations
ALTER COLUMN organization_db nvarchar(200);

GO

ALTER PROCEDURE dbo.uspGetAllPolicyList
AS
	-- Create a Table Variable to store the compiled pending accounts data in.
	DECLARE @CompiledPendingAccounts TABLE
	(
	  [organization_id] INT NOT NULL,
		[document_name] NVARCHAR(200) NOT NULL
	)

	/************************************************************
	* NEXT: ADD INFO FROM ALL CREATED ACCOUNTS
	************************************************************/
	-- Setup a new cursor to go through each created account.
	DECLARE @organization_id INT
	DECLARE @organization_name NVARCHAR(200)
	DECLARE @organization_db NVARCHAR(200)
	DECLARE @organization_status_id INT
	DECLARE @TEMPLATE NVARCHAR(500)
	DECLARE @SQL NVARCHAR(500)
	DECLARE org_cursor CURSOR FOR
	SELECT
	id, organization_name, organization_db, organization_status_id FROM Organizations

	-- Loop Through each organization and create compiled data.
	OPEN org_cursor
	FETCH NEXT FROM org_cursor
	INTO @organization_id, @organization_name, @organization_db, @organization_status_id
	WHILE  @@FETCH_STATUS = 0
	BEGIN
		-- Setup SQL Query to get data from database.
		SET @TEMPLATE = 'EXEC [{DATABASENAME}].[dbo].[uspGetPolicyList] {ORGID}'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @organization_db)
		SET @SQL = REPLACE(@SQL, '{ORGID}', @organization_id)

		-- Insert Row with data into compiled table.
		--SELECT @SQL
		--EXEC sp_executesql @SQL
		INSERT INTO @CompiledPendingAccounts EXEC sp_executesql @SQL

		-- Fetch Next Row.
		FETCH NEXT FROM org_cursor
		INTO @organization_id, @organization_name, @organization_db, @organization_status_id
	END
	CLOSE org_cursor
	DEALLOCATE org_cursor

	SELECT * FROM @CompiledPendingAccounts
GO

ALTER PROCEDURE uspGetLocationsCount
	@org_db NVARCHAR(200)
AS
	DECLARE @organization_db NVARCHAR(200)
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
	EXEC sp_executesql @SQL
GO

ALTER PROCEDURE dbo.uspDropDatabase
  @pendingaccounts_id INT
AS
  DECLARE @SQL NVARCHAR(MAX)
  DECLARE @ORGNAME NVARCHAR(200)
  DECLARE @DBNAME NVARCHAR(200)

  SET @ORGNAME = (SELECT organization_name FROM PendingAccounts WHERE id = @pendingaccounts_id)

	-- Removes spaces
  SET @ORGNAME = REPLACE(@ORGNAME, ' ', '')

  SET @DBNAME = '[clientstore-{ORGANIZATION}]'
  SET @DBNAME = REPLACE(@DBNAME, '{ORGANIZATION}', @ORGNAME)

  SET @SQL = 'DROP DATABASE IF EXISTS [{DATABASE}]'
  SET @SQL = REPLACE(@SQL, '{DATABASE}', @DBNAME)

  EXEC sp_executesql @SQL
GO

ALTER PROCEDURE dbo.uspCreateNewAccount
	@orgName NVARCHAR(200),
	@orgAddress NVARCHAR(200),
	@orgWebsite NVARCHAR(200),
	@isSubsidiary BIT = 0,
	@orgParent NVARCHAR(200) = ''
AS
	INSERT INTO PendingAccounts VALUES(@orgName, @orgAddress, @orgWebsite, @isSubsidiary, @orgParent)
	SELECT SCOPE_IDENTITY() AS [organization_id];
GO

ALTER PROCEDURE dbo.uspVerifyNewAccount
	@PendingAccountID INT
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)

	-- Obtain Organization Name.
	DECLARE @OrgName NVARCHAR(200)
	SELECT @OrgName = organization_name FROM PendingAccounts WHERE id = @PendingAccountID

	-- Use Master Database to verify the organization does not already have a db.
	IF @OrgName IS NOT NULL
		BEGIN
			SET @TEMPLATE = 'IF EXISTS(SELECT * FROM sys.databases WHERE name=[''{DATABASENAME}'']) SELECT 0 AS OrganizedVerified ELSE SELECT 1 AS OrganizationVerified'
			SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgName)
			EXEC sp_executesql @SQL
		END
	ELSE
		BEGIN
			SELECT 0 AS OrganizedVerified
		END
GO

ALTER PROCEDURE dbo.uspGetAllAccountsList
AS
	-- Create a Table Variable to store the compiled pending accounts data in.
	DECLARE @CompiledPendingAccounts TABLE
	(
		[organization_id] INT NOT NULL,
		[organization_name] NVARCHAR(200) NOT NULL,
		[organization_address] NVARCHAR(200) NOT NULL,
		[organization_website] NVARCHAR(200) NOT NULL,
		[organization_is_subsidiary] BIT NOT NULL,
		[organization_parent] NVARCHAR(200) NOT NULL,
		[organization_classifications_ids] NVARCHAR(100) NULL,
		[organization_status_id] INT,
		[organization_activated_time] SMALLDATETIME NULL
	)

	/************************************************************
	* FIRST: ADD INFO FROM ALL REQUESTED/PENDING ACCOUNTS
	************************************************************/
	-- Setup a new cursor to go through each pending account.
	DECLARE @organization_id INT,
			@organization_name NVARCHAR(200),
			@organization_address NVARCHAR(200),
			@organization_website NVARCHAR(200),
			@organization_is_subsidiary BIT,
			@organization_parent NVARCHAR(200)
	DECLARE org_cursor CURSOR FOR
	SELECT
	id, organization_name, organization_address, organization_website,
	organization_is_subsidiary, organization_parent FROM PendingAccounts

	-- Loop Through each pending account and create compiled data.
	OPEN org_cursor
	FETCH NEXT FROM org_cursor
	INTO @organization_id, @organization_name, @organization_address,
	@organization_website, @organization_is_subsidiary, @organization_parent
	WHILE  @@FETCH_STATUS = 0
	BEGIN
		-- Obtain Classifications Information for the Account.
		DECLARE @arrClassificationIds NVARCHAR(100)
		SELECT @arrClassificationIds = COALESCE(@arrClassificationIds + ',', '') + CONVERT(varchar(3), classification_id) FROM PendingAccountsClassifications WHERE pendingaccounts_id = @organization_id

		-- Insert Row with data into compiled table. (Assuming Pending = 1)
		INSERT INTO @CompiledPendingAccounts
		VALUES(@organization_id, @organization_name, @organization_address, @organization_website,
				@organization_is_subsidiary, @organization_parent, @arrClassificationIds, 1, NULL)

		-- Fetch Next Row.
		FETCH NEXT FROM org_cursor
		INTO @organization_id, @organization_name, @organization_address,
		@organization_website, @organization_is_subsidiary, @organization_parent

		-- Reset arrays for next account.
		SET @arrClassificationIds = NULL
	END
	CLOSE org_cursor
	DEALLOCATE org_cursor

	/************************************************************
	* NEXT: ADD INFO FROM ALL CREATED ACCOUNTS
	************************************************************/
	-- Setup a new cursor to go through each created account.
	DECLARE @organization_db NVARCHAR(200)
	DECLARE @organization_status_id INT
	DECLARE @organization_activated_time SMALLDATETIME
	DECLARE @TEMPLATE NVARCHAR(500)
	DECLARE @SQL NVARCHAR(500)
	DECLARE org_cursor CURSOR FOR
	SELECT
	id, organization_name, organization_db, organization_status_id, organization_activated_time FROM Organizations

	-- Loop Through each organization and create compiled data.
	OPEN org_cursor
	FETCH NEXT FROM org_cursor
	INTO @organization_id, @organization_name, @organization_db, @organization_status_id, @organization_activated_time
	WHILE  @@FETCH_STATUS = 0
	BEGIN
		-- Setup SQL Query to get data from database.
		SET @TEMPLATE = 'EXEC [{DATABASENAME}].[dbo].[uspGetAccountProfile] {ORGID}, {ORGSTATUSID}'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @organization_db)
		SET @SQL = REPLACE(@SQL, '{ORGID}', @organization_id)
		SET @SQL = REPLACE(@SQL, '{ORGSTATUSID}', @organization_status_id)

		-- Insert Row with data into compiled table.
		--SELECT @SQL
		--EXEC sp_executesql @SQL
		INSERT INTO @CompiledPendingAccounts (organization_id, [organization_name], organization_address, organization_website, organization_is_subsidiary, organization_parent, organization_classifications_ids, organization_status_id) EXEC sp_executesql @SQL
		UPDATE @CompiledPendingAccounts
		SET organization_activated_time = @organization_activated_time
		WHERE organization_id = @organization_id;
		-- Fetch Next Row.
		FETCH NEXT FROM org_cursor
		INTO @organization_id, @organization_name, @organization_db, @organization_status_id, @organization_activated_time
	END
	CLOSE org_cursor
	DEALLOCATE org_cursor

	SELECT * FROM @CompiledPendingAccounts
GO

ALTER PROCEDURE dbo.uspUpdatePendingAccount
	@orgID INT,
	@orgName NVARCHAR(200),
	@orgAddress NVARCHAR(200),
	@orgWebsite NVARCHAR(200),
	@isSubsidiary BIT = 0,
	@orgParent NVARCHAR(200) = '',
	@classification_ids NVARCHAR(200)
AS
	-- Update pending accounts table
	UPDATE PendingAccounts SET
		organization_name = @orgName,
		[organization_address] = @orgAddress,
		organization_website = @orgWebsite,
		organization_is_subsidiary = @isSubsidiary,
		organization_parent = @orgParent
	WHERE id=@orgID

	-- Delete classifications for the organization before re-adding
	DELETE FROM PendingAccountsClassifications WHERE pendingaccounts_id = @orgID

	-- Add the classifications for the organization
	DECLARE @pos INT
	DECLARE @len INT
	DECLARE @strClassificationId varchar(20)
	DECLARE @nClassificationId INT

	SET @pos = 1
	WHILE CHARINDEX(',', @classification_ids, @pos) > 0
	BEGIN
		SET @len = CHARINDEX(',', @classification_ids, @pos)
		SET @strClassificationId = SUBSTRING(@classification_ids, @pos, @len - @pos)
		SET @nClassificationId = CAST(@strClassificationId AS INT)
		INSERT INTO PendingAccountsClassifications VALUES(@orgID, @nClassificationId)
		SET @pos = @len + 1
	END
	SET @strClassificationId = SUBSTRING(@classification_ids, @pos, LEN(@classification_ids) - @pos + 1)
	SET @nClassificationId = CAST(@strClassificationId AS INT)
	INSERT INTO PendingAccountsClassifications VALUES(@orgID, @nClassificationId)
GO

ALTER PROCEDURE dbo.uspDeleteOrganization
(
@orgName NVARCHAR(200)
)
AS
	DECLARE @orgID INT
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @DBNAME NVARCHAR(200)

	SET @orgID = (SELECT id FROM Organizations where organization_name = @orgName)
	DELETE FROM UserRoutes where organization_id = @orgID
	DELETE FROM Organizations where organization_name = @orgName

	-- Removes spaces
	SET @ORGNAME = REPLACE(@ORGNAME, ' ', '')

	SET @DBNAME = '[clientstore-{ORGANIZATION}]'
	SET @DBNAME = REPLACE(@DBNAME, '{ORGANIZATION}', @ORGNAME)

	SET @SQL = 'DROP DATABASE IF EXISTS [{DATABASE}]'
	SET @SQL = REPLACE(@SQL, '{DATABASE}', @DBNAME)
	EXEC sp_executesql @SQL
GO






-- NEW June 8th 2019

CREATE PROCEDURE [dbo].[uspGetSimplifiedOilPalmConcessionsGeom]
    @location_ids NVARCHAR(MAX) = NULL
AS
    IF @location_ids IS NULL OR @location_ids = ''
        SELECT 2 as [list_id], location_id, Geometry.Reduce(0.008).ToString() as [WKTGeometry] FROM [list-oilPalmConcessions]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 2 as [list_id], location_id, Geometry.Reduce(0.008).ToString() as [WKTGeometry] FROM [list-oilPalmConcessions] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
        END

CREATE PROCEDURE [dbo].[uspGetSimplifiedRSPOOilPalmConcessionsGeom]
    @location_ids NVARCHAR(MAX) = NULL
AS
    IF @location_ids IS NULL OR @location_ids = ''
        SELECT 5 as [list_id], location_id, Geometry.Reduce(0.008).ToString() as [WKTGeometry] FROM [list-rspoOilPalmConcessions]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 5 as [list_id], location_id, Geometry.Reduce(0.008).ToString() as [WKTGeometry] FROM [list-rspoOilPalmConcessions] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
        END

CREATE PROCEDURE [dbo].[uspGetSimplifiedPalmOilMillsGeom]
    @location_ids NVARCHAR(MAX) = NULL
AS
    IF @location_ids IS NULL OR @location_ids = ''
        SELECT 3 as [list_id], location_id, [Geometry Simplified].ToString() as [WKTGeometry] FROM [list-palmOilMills]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 3 as [list_id], location_id, [Geometry Simplified].ToString() as [WKTGeometry] FROM [list-palmOilMills] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
        END
