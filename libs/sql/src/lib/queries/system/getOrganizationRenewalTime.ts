export const getOrganizationRenewalTime = `SELECT OG.renewal_time as 'orgRenewalTime' FROM Organizations OG WHERE OG.id = @orgId`;

export interface OrganizationRenewalTime {
  orgRenewalTime: string;
}
