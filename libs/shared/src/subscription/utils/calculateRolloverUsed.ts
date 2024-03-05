import { AnalysisLimit, OrganizationYearlyUsageSinceOrgActivation } from '@wri-monorepos/sql';

export interface RolloverAnalysisAmounts {
  rolloverAnalysisAreaUsed: number;
  rolloverLocationsUsed: number;
}
export function calculateRolloverUsed(
  yearlyUsageSinceActivation: OrganizationYearlyUsageSinceOrgActivation[],
  subscriptionLimits: Partial<AnalysisLimit>
): RolloverAnalysisAmounts {
  let rolloverAnalysisAreaUsed = 0;
  let rolloverLocationsUsed = 0;

  yearlyUsageSinceActivation.forEach((yearlyData) => {
    // rollover for area
    const areaRollover = Math.max(
      0,
      yearlyData.totalAreaPerLocationsAnalyzedYearly - subscriptionLimits.MaxAreaAnalyzeablePerYear
    );
    rolloverAnalysisAreaUsed += areaRollover;

    // rollover for locations
    const locationsRollover = Math.max(
      0,
      yearlyData.totalLocationsYearly - (subscriptionLimits.max_locations_per_year || 0)
    );
    rolloverLocationsUsed += locationsRollover;
  });

  return {
    rolloverAnalysisAreaUsed,
    rolloverLocationsUsed,
  };
}
