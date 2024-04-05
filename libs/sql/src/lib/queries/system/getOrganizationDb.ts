export const getOrganizationDb = `
SELECT organization_db as organizationDb FROM Organizations WHERE id = @organizationId
`;

export interface GetOrganizationDatabaseType {
  organizationDb: string;
}
