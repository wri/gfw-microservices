import { getAccountAnalysisLimits, AnalysisLimit } from '@wri-monorepos/sql';

export function combineOrganizationLimits(
  subscriptionLimits: AnalysisLimit,
  extraLimits: AnalysisLimit
) {
  return {
    ...subscriptionLimits,
    ...extraLimits,
    MaxAreaAnalyzeablePerYear:
      subscriptionLimits.MaxAreaAnalyzeablePerYear + extraLimits.MaxAreaAnalyzeablePerYear,
    MaxAreaPerList: subscriptionLimits.MaxAreaPerList + extraLimits.MaxAreaPerList,
    max_locations_per_year:
      (subscriptionLimits.max_locations_per_year || 0) + (extraLimits.max_locations_per_year || 0),
  };
}

export async function getAccountSubscriptionLimits(organizationType: number) {
  return await getAccountAnalysisLimits({ organizationType });
}

export async function getAccountExtraLimits(organizationId: number) {
  return await getAccountAnalysisLimits({ organizationId });
}

export async function getAccountComputedLimits(organizationId: number, organizationType: number) {
  const organizationExtraLimits = await getAccountExtraLimits(organizationId);
  const organizationSubscriptionLimits = await getAccountSubscriptionLimits(organizationType);

  return organizationExtraLimits
    ? combineOrganizationLimits(organizationExtraLimits, organizationSubscriptionLimits)
    : organizationSubscriptionLimits;
}
