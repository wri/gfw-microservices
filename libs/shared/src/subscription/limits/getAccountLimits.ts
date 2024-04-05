import { getAccountAnalysisLimits } from '@wri-monorepos/sql';
import { combineOrganizationLimits } from '../utils';
import { getAccountRolloverLimits } from './getAccountRolloverLimits';

export async function getAccountSubscriptionLimits(organizationType: number) {
  return await getAccountAnalysisLimits({ organizationType });
}

export async function getAccountExtraLimits(organizationId: number) {
  return await getAccountAnalysisLimits({ organizationId });
}

export async function getAccountLimits(organizationId: number, organizationType: number) {
  const organizationExtraLimits = await getAccountExtraLimits(organizationId);
  const organizationSubscriptionLimits = await getAccountSubscriptionLimits(organizationType);
  const organizationRolloverLimits = await getAccountRolloverLimits(
    organizationId,
    organizationSubscriptionLimits,
    organizationExtraLimits
  );

  return combineOrganizationLimits(organizationSubscriptionLimits, organizationRolloverLimits);
}
