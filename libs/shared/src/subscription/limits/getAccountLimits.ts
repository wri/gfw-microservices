import { getAccountAnalysisLimits } from '@wri-monorepos/sql';
import { combineOrganizationLimits } from '../utils';

export async function getAccountSubscriptionLimits(organizationType: number) {
  return await getAccountAnalysisLimits({ organizationType });
}

export async function getAccountExtraLimits(organizationId: number) {
  return await getAccountAnalysisLimits({ organizationId });
}

export async function getAccountLimits(organizationId: number, organizationType: number) {
  const organizationExtraLimits = await getAccountExtraLimits(organizationId);
  const organizationSubscriptionLimits = await getAccountSubscriptionLimits(organizationType);

  return organizationExtraLimits
    ? combineOrganizationLimits(organizationExtraLimits, organizationSubscriptionLimits)
    : organizationSubscriptionLimits;
}
