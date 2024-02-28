import { AnalysisLimit } from '@wri-monorepos/sql';

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
