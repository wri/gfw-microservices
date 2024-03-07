import { createEmptyAnalysisObject, getAccountAnalysisLimits } from '@wri-monorepos/sql';
import { combineOrganizationLimits } from '../utils';

export async function getAccountSubscriptionLimits(organizationType: number) {
  return await getAccountAnalysisLimits({ organizationType });
}

export async function getAccountExtraLimits(organizationId: number) {
  const extraLimits = await getAccountAnalysisLimits({ organizationId });

  return (
    extraLimits ||
    createEmptyAnalysisObject({
      OrgID: organizationId,
    })
  );
}

export async function getAccountLimits(organizationId: number, organizationType: number) {
  const organizationExtraLimits = await getAccountExtraLimits(organizationId);
  const organizationSubscriptionLimits = await getAccountSubscriptionLimits(organizationType);

  return combineOrganizationLimits(organizationSubscriptionLimits, organizationExtraLimits);
}
