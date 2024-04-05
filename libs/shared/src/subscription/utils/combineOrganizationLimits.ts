import { AnalysisLimit } from '@wri-monorepos/sql';

export function combineOrganizationLimits(
  subscriptionLimits: AnalysisLimit,
  extraLimits: AnalysisLimit
) {
  return {
    MaxAreaAnalyzeablePerYear:
      subscriptionLimits.MaxAreaAnalyzeablePerYear + extraLimits.MaxAreaAnalyzeablePerYear,
    max_locations_per_year:
      (subscriptionLimits.max_locations_per_year || 0) + (extraLimits.max_locations_per_year || 0),
  };
}
