/**
 * Check if an organization name already exists (case-insensitive)
 * @OrganizationName VARCHAR
 * Returns 1 if exists, 0 otherwise
 */
export const checkOrgName = `
SELECT COUNT(*) AS count
FROM Organizations
WHERE LOWER(organization_name) = LOWER(@OrganizationName);
`;
