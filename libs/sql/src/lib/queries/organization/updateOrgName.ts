/**
 * Update the name of an organization
 * @OrganizationId INT,
 * @OrganizationName VARCHAR
 * Returns the updated organization record
 */
export const updateOrgName = `
UPDATE Organizations
SET organization_name = @OrganizationName
WHERE id = @OrganizationId;

SELECT id, organization_name
FROM Organizations
WHERE id = @OrganizationId;
`;
