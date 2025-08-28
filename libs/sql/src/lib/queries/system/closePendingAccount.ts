/**
 * GPV-4942 (Related to GPV-4828 and GPV-4829)
 *
 * This SQL script is used to close (deactivate) an account in the PendingAccounts table.
 * It sets the organization_active flag to 0 (false) for the specified organization_id.
 * Ensure that organization_id is provided.
 * @param organizationId INT
 */
export const closeAccount = `
    -- Validate organizationId is NOT NULL
    IF @organizationId IS NULL
    BEGIN
        RAISERROR('organization_id cannot be NULL', 16, 1);
        RETURN;
    END

    -- Update PendingAccounts to set organization_active to 0 (false)
    UPDATE PendingAccounts
    SET organization_active = 0
    WHERE organization_id = @organizationId;

    -- Optionally, return the updated row
    SELECT *
    FROM PendingAccounts
    WHERE organization_id = @organizationId;
`;
