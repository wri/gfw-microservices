const getUsersList = `-- Create a Table Variable to store the compiled user data  for the company.
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

export { getUsersList };
