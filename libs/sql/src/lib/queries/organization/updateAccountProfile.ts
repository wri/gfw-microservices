/**
 * @orgName NVARCHAR(200)
 * @orgAddress NVARCHAR(200)
 * @orgWebsite NVARCHAR(200)
 * @isSubsidiary BIT = 0
 * @orgParent NVARCHAR(200) = ''
 */
export const updateAccountProfile = `
UPDATE AccountProfile SET
  organization_name = @orgName,
  organization_address = @orgAddress,
  organization_website = @orgWebsite,
  organization_is_subsidiary = @isSubsidiary,
  organization_parent = @orgParent
`;
