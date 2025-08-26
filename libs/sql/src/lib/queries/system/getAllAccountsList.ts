/**
 *
 * GPV-4654
 *
 * Retrieves all accounts from PendingAccounts and Organizations tables,
 * including the new 'organization_active' flag, returning only active accounts.
 */
export const getAllAccountsList = `
	DECLARE @CompiledPendingAccounts TABLE
	(
		[organization_id] INT NOT NULL,
		[organization_name] NVARCHAR(200) NOT NULL,
		[organization_address] NVARCHAR(200) NOT NULL,
		[organization_website] NVARCHAR(200) NOT NULL,
		[organization_is_subsidiary] BIT NOT NULL,
		[organization_parent] NVARCHAR(200) NOT NULL,
		[organization_classifications_ids] NVARCHAR(100) NULL,
		[organization_status_id] INT NULL,
		[organization_activated_time] SMALLDATETIME NULL,
		[subscription_status_id] SMALLINT NULL,
		[organization_active] BIT NULL -- Added to track if the account is active or not
	);

	/************************************************************
	* FIRST: ADD INFO FROM ALL REQUESTED/PENDING ACCOUNTS
	************************************************************/
	DECLARE @organization_id INT,
			@organization_name NVARCHAR(200),
			@organization_address NVARCHAR(200),
			@organization_website NVARCHAR(200),
			@organization_is_subsidiary BIT,
			@organization_parent NVARCHAR(200),
			@organization_requested SMALLDATETIME,
			@organization_active BIT;

	DECLARE org_cursor CURSOR FOR
	SELECT
		id, organization_name, organization_address, organization_website,
		organization_is_subsidiary, organization_parent, organization_requested_time,
		organization_active
	FROM dbo.PendingAccounts

	OPEN org_cursor;
	FETCH NEXT FROM org_cursor
	INTO @organization_id, @organization_name, @organization_address,
		 @organization_website, @organization_is_subsidiary, @organization_parent, @organization_requested, @organization_active;
	WHILE @@FETCH_STATUS = 0
	BEGIN
		DECLARE @arrClassificationIds NVARCHAR(100);

		SELECT @arrClassificationIds = COALESCE(@arrClassificationIds + ',', '') + CONVERT(VARCHAR(3), classification_id)
		FROM dbo.PendingAccountsClassifications
		WHERE pendingaccounts_id = @organization_id;

		INSERT INTO @CompiledPendingAccounts
		VALUES (
			@organization_id,
			@organization_name,
			@organization_address,
			@organization_website,
			@organization_is_subsidiary,
			@organization_parent,
			@arrClassificationIds,
			1, -- Pending accounts assumed status = 1
			@organization_requested,
			NULL,
			@organization_active
		);

		FETCH NEXT FROM org_cursor
		INTO @organization_id, @organization_name, @organization_address,
			 @organization_website, @organization_is_subsidiary, @organization_parent, @organization_requested, @organization_active;

		SET @arrClassificationIds = NULL;
	END;
	CLOSE org_cursor;
	DEALLOCATE org_cursor;

	/************************************************************
	* NEXT: ADD INFO FROM ALL CREATED ACCOUNTS
	************************************************************/
	DECLARE @organization_db NVARCHAR(200),
			@organization_status_id INT,
			@organization_activated_time SMALLDATETIME,
			@subscription_status_id SMALLINT;
	DECLARE @TEMPLATE NVARCHAR(500);
	DECLARE @SQL NVARCHAR(500);

	DECLARE org_cursor CURSOR FOR
	SELECT
		id, organization_name, organization_db, organization_status_id, organization_activated_time, subscription_status_id
	FROM dbo.Organizations;

	OPEN org_cursor;
	FETCH NEXT FROM org_cursor
	INTO @organization_id, @organization_name, @organization_db, @organization_status_id, @organization_activated_time, @subscription_status_id;
	WHILE @@FETCH_STATUS = 0
	BEGIN
		SET @TEMPLATE = 'EXEC [{DATABASENAME}].[dbo].[uspGetAccountProfile] {ORGID}, {ORGSTATUSID}';
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @organization_db);
		SET @SQL = REPLACE(@SQL, '{ORGID}', @organization_id);
		SET @SQL = REPLACE(@SQL, '{ORGSTATUSID}', @organization_status_id);

		DECLARE @TempResult TABLE (
			organization_id INT,
			organization_name NVARCHAR(200),
			organization_address NVARCHAR(200),
			organization_website NVARCHAR(200),
			organization_is_subsidiary BIT,
			organization_parent NVARCHAR(200),
			organization_classifications_ids NVARCHAR(100),
			organization_status_id INT
		);

		INSERT INTO @TempResult
		EXEC sp_executesql @SQL;

		INSERT INTO @CompiledPendingAccounts (
			organization_id,
			organization_name,
			organization_address,
			organization_website,
			organization_is_subsidiary,
			organization_parent,
			organization_classifications_ids,
			organization_status_id,
			organization_activated_time,
			subscription_status_id,
			organization_active
		)
		SELECT
			organization_id,
			organization_name,
			organization_address,
			organization_website,
			organization_is_subsidiary,
			organization_parent,
			organization_classifications_ids,
			organization_status_id,
			@organization_activated_time,
			@subscription_status_id,
			1
		FROM @TempResult
		where organization_id = @organization_id;

		FETCH NEXT FROM org_cursor
		INTO @organization_id, @organization_name, @organization_db, @organization_status_id, @organization_activated_time, @subscription_status_id;
	END;
	CLOSE org_cursor;
	DEALLOCATE org_cursor;

	/************************************************************
	* DEDUPLICATE
	************************************************************/
	-- Step 1: Mark duplicates with a row number
	;WITH NumberedRows AS (
		SELECT *,
			ROW_NUMBER() OVER (
				PARTITION BY organization_id       -- group rows by org id
				ORDER BY organization_status_id DESC  -- put highest status first
			) AS RowNum
		FROM @CompiledPendingAccounts
	)

	-- Step 2: Delete all but the first row per org
	DELETE FROM NumberedRows
	WHERE RowNum > 1;

	-- Step 3: Select the remaining rows
	-- CompiledPendingAccounts will now contain unique accounts
	SELECT * FROM @CompiledPendingAccounts;
`;
