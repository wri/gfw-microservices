/**
 *
 * Mirrors dbo.uspUpdatePendingAccount behavior.
 *
 * @param orgID INT
 * @param orgName NVARCHAR(200)
 * @param orgAddress NVARCHAR(200)
 * @param orgCountry NVARCHAR(100) = NULL
 * @param orgWebsite NVARCHAR(200)
 * @param isSubsidiary BIT = 0
 * @param orgParent NVARCHAR(200) = ''
 * @param classification_ids NVARCHAR(200) -- comma-separated list
 */
export const updatePendingAccount = `
  -- Update pending account metadata
  UPDATE PendingAccounts
  SET organization_name = @orgName,
      organization_address = @orgAddress,
      organization_country = COALESCE(@orgCountry, organization_country),
      organization_website = @orgWebsite,
      organization_is_subsidiary = @isSubsidiary,
      organization_parent = @orgParent
  WHERE id = @orgID;

  -- Replace account classifications from comma-separated list
  DELETE FROM PendingAccountsClassifications
  WHERE pendingaccounts_id = @orgID;

  IF NULLIF(@classification_ids, '') IS NOT NULL
  BEGIN
    INSERT INTO PendingAccountsClassifications (pendingaccounts_id, classification_id)
    SELECT @orgID,
           CAST(LTRIM(RTRIM(value)) AS INT)
    FROM STRING_SPLIT(@classification_ids, ',')
    WHERE LTRIM(RTRIM(value)) <> '';
  END
`;
