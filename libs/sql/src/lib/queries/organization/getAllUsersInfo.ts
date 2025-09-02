/**
 * @orgID INT
 * @orgName NVARCHAR(200)
 */
export const getAllUsersInfo = `
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
		SELECT @arrCommodities = COALESCE(@arrCommodities + ',', '') + CONVERT(varchar(3), commodity_id)
		FROM UserCommodities WHERE [user_id] = @userID

		-- Obtain User Geographies Info.
		DECLARE @arrGeographies NVARCHAR(100)
		SELECT @arrGeographies = COALESCE(@arrGeographies + ',', '') + CONVERT(varchar(3), geography_id)
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

	SELECT * FROM @CompiledUsers
`;
