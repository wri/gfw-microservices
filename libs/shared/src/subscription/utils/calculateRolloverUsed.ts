import { AnalysisLimit, OrganizationYearlyUsageSinceOrgActivation } from '@wri-monorepos/sql';

export interface RolloverAnalysisAmounts {
  rolloverAreaAnalyzable: number;
  rolloverLocations: number;
}
export function calculateRolloverUsed(
  yearlyUsageSinceActivation: OrganizationYearlyUsageSinceOrgActivation[],
  subscriptionLimits: AnalysisLimit
): RolloverAnalysisAmounts {
  let rolloverAreaAnalyzable = 0;
  let rolloverLocations = 0;

  yearlyUsageSinceActivation.forEach((yearlyData) => {
    // rollover for area
    const areaRollover = Math.max(
      0,
      yearlyData.totalAreaAnalyzedYearly - subscriptionLimits.MaxAreaAnalyzeablePerYear
    );
    rolloverAreaAnalyzable += areaRollover;

    // rollover for locations
    const locationsRollover = Math.max(
      0,
      yearlyData.totalLocationsYearly - (subscriptionLimits.max_locations_per_year || 0)
    );
    rolloverLocations += locationsRollover;
  });

  return {
    rolloverAreaAnalyzable,
    rolloverLocations,
  };
}
