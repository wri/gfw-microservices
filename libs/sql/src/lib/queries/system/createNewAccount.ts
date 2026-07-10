/**
 *
 * GPV-4654
 *
 * This SQL script is used to create a new account in the PendingAccounts table.
 * It validates the request date and inserts the new account details.
 * The organization_id is returned after the insertion.
 * Ensure that the request date is not NULL before proceeding with the insertion.
 * @param orgName NVARCHAR(200)
 * @param orgAddress NVARCHAR(200)
 * @param orgCountry NVARCHAR(100)
 * @param orgWebsite NVARCHAR(200)
 * @param isSubsidiary BIT = 0
 * @param orgParent NVARCHAR(200) = ''
 * @param requestDate SMALLDATETIME
 * @param active BIT = 1
 */
export const createNewAccount = `
	-- Validate requestDate is NOT NULL
	IF @requestDate IS NULL
	BEGIN
		RAISERROR('organization_requested_time cannot be NULL', 16, 1);
		RETURN;
	END

	-- Insert into PendingAccounts with explicit columns including Active flag
	INSERT INTO PendingAccounts (
		organization_name,
		organization_address,
		organization_country,
		organization_website,
		organization_is_subsidiary,
		organization_parent,
		organization_requested_time,
		organization_active
	)
	VALUES (
		@orgName,
		@orgAddress,
		@orgCountry,
		@orgWebsite,
		@isSubsidiary,
		@orgParent,
		@requestDate,
		ISNULL(@active, 1)
	);

	-- Return new organization_id
	SELECT SCOPE_IDENTITY() AS [organization_id];
`;
