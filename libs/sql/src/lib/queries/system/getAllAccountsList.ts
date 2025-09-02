/**
 * (no parameters)
 */
export const getAllAccountsList = `
	/* ==========================================================
	   Build a consolidated list of accounts
	   - Pending accounts: from system dbo.PendingAccounts (+ classes)
	   - Created accounts: pull profile + classes from each org DB directly
	     (no stored procedure calls)
	   ========================================================== */

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
		[organization_active] BIT NULL
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
	FROM dbo.PendingAccounts;

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
		(
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
		VALUES
		(
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
	* NEXT: ADD INFO FROM ALL CREATED ACCOUNTS  (no SP calls)
	*  - For each org, read from [<orgdb>].dbo.AccountProfile
	*    and build classification_ids from [<orgdb>].dbo.AccountClassifications
	************************************************************/
	DECLARE @organization_db NVARCHAR(200),
			@organization_status_id INT,
			@organization_activated_time SMALLDATETIME,
			@subscription_status_id SMALLINT;

	DECLARE org_cursor2 CURSOR FOR
	SELECT
		id, organization_name, organization_db, organization_status_id, organization_activated_time, subscription_status_id
	FROM dbo.Organizations;

	OPEN org_cursor2;

	FETCH NEXT FROM org_cursor2
	INTO @organization_id, @organization_name, @organization_db, @organization_status_id, @organization_activated_time, @subscription_status_id;

	WHILE @@FETCH_STATUS = 0
	BEGIN
		/* Build a dynamic SELECT that matches the old uspGetAccountProfile logic
		   but reads tables directly (AccountProfile + AccountClassifications). */
		DECLARE @SQL NVARCHAR(MAX);

		SET @SQL = N'
DECLARE @arrClassificationIds NVARCHAR(100);

-- Build comma-delimited classification IDs from org DB
SELECT @arrClassificationIds = COALESCE(@arrClassificationIds + '','', '''') + CONVERT(VARCHAR(3), classification_id)
FROM ' + QUOTENAME(@organization_db) + N'.dbo.AccountClassifications;

-- Always return a single row representing this org''s profile
SELECT
    ' + CAST(@organization_id AS NVARCHAR(20)) + N'        AS organization_id,
    ap.organization_name,
    ap.organization_address,
    ap.organization_website,
    ap.organization_is_subsidiary,
    ap.organization_parent,
    @arrClassificationIds                                AS organization_classifications_ids,
    ' + COALESCE(CAST(@organization_status_id AS NVARCHAR(20)), N'NULL') + N' AS organization_status_id
FROM ' + QUOTENAME(@organization_db) + N'.dbo.AccountProfile AS ap;';

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
		WHERE organization_id = @organization_id;

		FETCH NEXT FROM org_cursor2
		INTO @organization_id, @organization_name, @organization_db, @organization_status_id, @organization_activated_time, @subscription_status_id;
	END;

	CLOSE org_cursor2;
	DEALLOCATE org_cursor2;

	/************************************************************
	* DEDUPLICATE (prefer highest status per org)
	************************************************************/
	;WITH NumberedRows AS (
		SELECT *,
			ROW_NUMBER() OVER (
				PARTITION BY organization_id
				ORDER BY organization_status_id DESC
			) AS RowNum
		FROM @CompiledPendingAccounts
	)
	DELETE FROM NumberedRows WHERE RowNum > 1;

	-- Final result
	SELECT * FROM @CompiledPendingAccounts;
`;
