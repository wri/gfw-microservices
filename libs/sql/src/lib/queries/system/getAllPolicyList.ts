/**
 * (no parameters)
 */
export const getAllPolicyList = `
	-- Consolidated policy list across all active organizations (no SP calls)
	DECLARE @CompiledPendingAccounts TABLE
	(
	  [organization_id] INT NOT NULL,
	  [document_name]   NVARCHAR(200) NOT NULL
	);

	-- Iterate active organizations and read directly from each org DB
	DECLARE @organization_id         INT;
	DECLARE @organization_db         NVARCHAR(200);

	DECLARE org_cursor CURSOR FOR
		SELECT id, organization_db
		FROM Organizations
		WHERE organization_status_id = 2;

	OPEN org_cursor;
	FETCH NEXT FROM org_cursor INTO @organization_id, @organization_db;

	WHILE @@FETCH_STATUS = 0
	BEGIN
		-- Mirror original uspGetPolicyList behavior:
		-- SELECT @orgID AS organization_id, document_name
		-- FROM AccountProfile CROSS JOIN Policies
		-- (AccountProfile is expected to be a single row per org; CROSS JOIN preserves prior semantics.)
		DECLARE @SQL NVARCHAR(MAX) = N'
SELECT
	@OrgID AS organization_id,
	p.document_name
FROM ' + QUOTENAME(@organization_db) + N'.dbo.Policies AS p
CROSS JOIN ' + QUOTENAME(@organization_db) + N'.dbo.AccountProfile AS ap;';

		INSERT INTO @CompiledPendingAccounts (organization_id, document_name)
		EXEC sp_executesql
			@SQL,
			N'@OrgID INT',
			@OrgID = @organization_id;

		FETCH NEXT FROM org_cursor INTO @organization_id, @organization_db;
	END;

	CLOSE org_cursor;
	DEALLOCATE org_cursor;

	SELECT * FROM @CompiledPendingAccounts;
`;
