/**
 * (no parameters)
 */
export const getAllUsersList = `
	-- Consolidated list of users across PendingAccounts and all active Organizations
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
		[user_id] INT NULL,
		[deactivation_date] SMALLDATETIME NULL,
		[country] NVARCHAR(100) NULL,
		[language] NCHAR(2) NULL
	);

	/************************************************************
	* FIRST: ADD INFO FROM ALL REQUESTED/PENDING USERS
	************************************************************/
	DECLARE @organization_id INT,
	        @organization_name NVARCHAR(200);

	DECLARE user_cursor CURSOR FOR
		SELECT id, organization_name
		FROM PendingAccounts;

	OPEN user_cursor;
	FETCH NEXT FROM user_cursor INTO @organization_id, @organization_name;

	WHILE @@FETCH_STATUS = 0
	BEGIN
		DECLARE @userid INT,
		        @first_name NVARCHAR(35),
		        @middle_initial NVARCHAR(2),
		        @last_name NVARCHAR(35),
		        @email NVARCHAR(50),
		        @phone VARCHAR(50),
		        @email_subscription INT,
		        @viirsEmailFrequency INT,
		        @gladEmailFrequency INT,
		        @formaEmailFrequency INT,
		        @terraiEmailFrequency INT,
		        @granChacoEmailFrequency INT,
		        @auth_preference_id INT,
		        @title_id INT,
		        @other_title NVARCHAR(150),
		        @access_level_id INT,
		        @access_level VARCHAR(30),
		        @status_id INT,
		        @status_level VARCHAR(30);

		SELECT
			@userid = id,
			@first_name = first_name,
			@middle_initial = middle_initial,
			@last_name = last_name,
			@email = email,
			@phone = phone,
			@title_id = title_id,
			@other_title = other_title,
			@access_level_id = access_level_id,
			@status_id = status_id,
			@email_subscription = email_subscription
		FROM PendingAccountsUsers
		WHERE pendingaccounts_id = @organization_id;

		SET @viirsEmailFrequency = 0;
		SET @gladEmailFrequency = 0;
		SET @formaEmailFrequency = 0;
		SET @terraiEmailFrequency = 0;
		SET @granChacoEmailFrequency = 0;

		DECLARE @arrCommodities NVARCHAR(100);
		SELECT @arrCommodities = COALESCE(@arrCommodities + ',', '') + CONVERT(VARCHAR(3), commodity_id)
		FROM PendingAccountsUsersCommodities
		WHERE pendingaccountsuser_id = @userid;

		DECLARE @arrGeographies NVARCHAR(100);
		SELECT @arrGeographies = COALESCE(@arrGeographies + ',', '') + CONVERT(VARCHAR(3), geography_id)
		FROM PendingAccountsUsersGeographies
		WHERE pendingaccountsuser_id = @userid;

		SELECT @status_level = status_name FROM Statuses WHERE id = @status_id;
		SELECT @access_level = accesslevel_name FROM AccessLevels WHERE id = @access_level_id;

		SET @auth_preference_id = 0;

		INSERT INTO @CompiledPendingAccounts
		VALUES
		(
			@organization_id,
			@organization_name,
			@first_name,
			@middle_initial,
			@last_name,
			@email,
			@phone,
			@title_id,
			@other_title,
			@access_level_id,
			@arrCommodities,
			@arrGeographies,
			@email_subscription,
			@viirsEmailFrequency,
			@gladEmailFrequency,
			@formaEmailFrequency,
			@terraiEmailFrequency,
			@granChacoEmailFrequency,
			@auth_preference_id,
			@status_id,
			NULL,   -- user_activated_time
			@userid,
			NULL,   -- deactivation_date
			NULL,   -- country
			NULL    -- language
		);

		FETCH NEXT FROM user_cursor INTO @organization_id, @organization_name;
		SET @arrCommodities = NULL;
		SET @arrGeographies = NULL;
	END;

	CLOSE user_cursor;
	DEALLOCATE user_cursor;

	/************************************************************
	* NEXT: ADD INFO FROM ALL USERS IN ALREADY CREATED ACCOUNTS
	* (no stored-procedure calls; read org DB tables directly)
	************************************************************/
	DECLARE @organization_db NVARCHAR(200),
	        @organization_status_id INT;

	DECLARE org_cursor CURSOR FOR
		SELECT id, organization_name, organization_db, organization_status_id
		FROM Organizations
		WHERE organization_status_id = 2;

	OPEN org_cursor;
	FETCH NEXT FROM org_cursor INTO @organization_id, @organization_name, @organization_db, @organization_status_id;

	WHILE @@FETCH_STATUS = 0
	BEGIN
		DECLARE @SQL NVARCHAR(MAX);

		-- Build a set-based query inside the org DB that mirrors uspGetAllUsersInfo
		SET @SQL = N'
SELECT
	@OrgID   AS organization_id,
	@OrgName AS organization_name,
	u.first_name,
	u.middle_initial,
	u.last_name,
	u.email,
	u.phone,
	u.title_id,
	u.other_title,
	u.access_level_id,
	-- user_commodity_ids
	(
		SELECT STUFF((
			SELECT '','' + CONVERT(VARCHAR(3), uc.commodity_id)
			FROM ' + QUOTENAME(@organization_db) + N'.dbo.UserCommodities uc
			WHERE uc.[user_id] = u.id
			FOR XML PATH(''''), TYPE
		).value(''.'',''nvarchar(max)''), 1, 1, '''')
	) AS user_commodity_ids,
	-- user_geography_ids
	(
		SELECT STUFF((
			SELECT '','' + CONVERT(VARCHAR(3), ug.geography_id)
			FROM ' + QUOTENAME(@organization_db) + N'.dbo.UserGeographies ug
			WHERE ug.[user_id] = u.id
			FOR XML PATH(''''), TYPE
		).value(''.'',''nvarchar(max)''), 1, 1, '''')
	) AS user_geography_ids,
	u.email_subscription,
	u.viirs_email_frequency,
	u.glad_email_frequency,
	u.forma_email_frequency,
	u.terrai_email_frequency,
	u.gran_chaco_email_frequency,
	0 AS auth_preference_id,         -- keep legacy behavior
	u.status_id AS user_status_id,
	u.activated_time AS user_activated_time,
	u.id AS user_id,
	u.deactivation_date,
	u.country,
	u.language
FROM ' + QUOTENAME(@organization_db) + N'.dbo.Users AS u
WHERE u.is_system_user = 0;
';

		-- Insert result rows into the compiled table
		INSERT INTO @CompiledPendingAccounts
		EXEC sp_executesql
			@SQL,
			N'@OrgID INT, @OrgName NVARCHAR(200)',
			@OrgID = @organization_id,
			@OrgName = @organization_name;

		FETCH NEXT FROM org_cursor INTO @organization_id, @organization_name, @organization_db, @organization_status_id;
	END;

	CLOSE org_cursor;
	DEALLOCATE org_cursor;

	-- Final result
	SELECT * FROM @CompiledPendingAccounts;
`;
