import { AnalysisLimit, getAccountAnalysisLimits } from '@wri-monorepos/sql';
import { combineOrganizationLimits } from '../utils';
import { getAccountRolloverLimits } from './getAccountRolloverLimits';

export async function getAccountSubscriptionLimits(organizationType: number) {
  const analysisLimit = await getAccountAnalysisLimits({ organizationType });
  return transformData(analysisLimit);
}

export async function getAccountExtraLimits(organizationId: number) {
  const analysisLimit = await getAccountAnalysisLimits({ organizationId });
  return transformData(analysisLimit);
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

function transformData(analysisLimit: AnalysisLimit) {
  return {
    ...analysisLimit,
    max_locations_per_year: Number(analysisLimit.max_locations_per_year),
  };
}
