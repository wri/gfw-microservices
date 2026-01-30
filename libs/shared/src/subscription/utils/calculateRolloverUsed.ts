import { AnalysisLimit, OrganizationYearlyUsageSinceOrgActivation } from '@wri-monorepos/sql';
import { differenceInCalendarDays } from 'date-fns';

export interface RolloverAnalysisAmounts {
  rolloverAnalysisAreaUsed: number;
  rolloverLocationsUsed: number;
}
export function calculateRolloverUsed(
  yearlyUsageSinceActivation: OrganizationYearlyUsageSinceOrgActivation[],
  subscriptionLimits: AnalysisLimit,
  accountRenewalMoment: Date
): RolloverAnalysisAmounts {
  let rolloverAnalysisAreaUsed = 0;
  let rolloverLocationsUsed = 0;

  // Calculate current year in same units as yearlyUsageSinceActivation
  const now = new Date();
  const currentYear = Math.floor(differenceInCalendarDays(now, accountRenewalMoment) / 365.25);
  yearlyUsageSinceActivation.forEach((yearlyData) => {
    // skip current year because it is used for current usage
    if (yearlyData.years_since_activation === currentYear) {
      return;
    }
    // rollover for area
    const areaRollover = Math.max(
      0,
      yearlyData.totalAreaPerLocationsAnalyzedYearly -
        (subscriptionLimits.MaxAreaAnalyzeablePerYear ?? 0)
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
