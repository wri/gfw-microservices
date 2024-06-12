import { AnalysisLimit, OrganizationYearlyUsageSinceOrgActivation } from '@wri-monorepos/sql';
import moment = require('moment');

export interface RolloverAnalysisAmounts {
  rolloverAnalysisAreaUsed: number;
  rolloverLocationsUsed: number;
}
export function calculateRolloverUsed(
  yearlyUsageSinceActivation: OrganizationYearlyUsageSinceOrgActivation[],
  subscriptionLimits: AnalysisLimit,
  accountRenewalMoment: moment.Moment
): RolloverAnalysisAmounts {
  let rolloverAnalysisAreaUsed = 0;
  let rolloverLocationsUsed = 0;

  // Calculate current year in same units as yearlyUsageSinceActivation
  const now = moment();
  const currentYear = Math.floor(moment.duration(now.diff(accountRenewalMoment)).asYears());
  yearlyUsageSinceActivation.forEach((yearlyData) => {
    // skip current year because it is used for current usage
    if (yearlyData.years_since_activation === currentYear) {
      return;
    }
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
