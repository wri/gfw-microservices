/**
 * GPV-4942 (Related to GPV-4828 and GPV-4829)
 *
 * This SQL script is used to close (deactivate) an account in the PendingAccounts table.
 * It sets the organization_active flag to 0 (false) for the specified organization_id.
 * Ensure that organization_id is provided.
 * @param pendingAccountId INT
 */
export const closePendingAccount = `
    -- Validate pendingAccountId is NOT NULL
    IF @pendingAccountId IS NULL
    BEGIN
        RAISERROR('pendingAccountId cannot be NULL', 16, 1);
        RETURN;
    END

    -- Update PendingAccounts to set organization_active to 0 (false)
    UPDATE PendingAccounts
    SET organization_active = 0
    WHERE id = @pendingAccountId;

    -- Optionally, return the updated row
    SELECT *
    FROM PendingAccounts
    WHERE id = @pendingAccountId;
`;
