export const getOrganizationActivatedTime = `SELECT OG.organization_activated_time as 'OrganizationActivatedTime' FROM Organizations OG WHERE OG.id = @orgId`;

export interface OrganizationActivatedTime {
  OrganizationActivatedTime: string;
}
