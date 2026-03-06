import { AnalysisLimit, getAccountYearlyUsageSinceActivation } from '@wri-monorepos/sql';
import { calculateRolloverUsed } from '../utils';
import { format as formatDate } from 'date-fns';

export async function getAccountRolloverLimits(
  organizationId: number,
  subscriptionLimits: AnalysisLimit,
  extendedLimits: AnalysisLimit,
  renewalDate: Date
) {
  const yearlyUsageSinceActivation = await getAccountYearlyUsageSinceActivation(
    organizationId,
    formatDate(renewalDate, 'yyyy-MM-dd')
  );

  // RolloverUsed = for[y]yearlyUsageSinceActivation -= subscriptionLimits
  const rolloverUsed = calculateRolloverUsed(
    yearlyUsageSinceActivation,
    subscriptionLimits,
    renewalDate
  );

  // RolloverRemaining = extendedLimits - RolloverUsed
  return {
    MaxAreaAnalyzeablePerYear:
      extendedLimits.MaxAreaAnalyzeablePerYear - rolloverUsed.rolloverAnalysisAreaUsed,
    MaxAreaPerList: extendedLimits.MaxAreaPerList,
    max_locations_per_year:
      (extendedLimits.max_locations_per_year || 0) - rolloverUsed.rolloverLocationsUsed,
    tokens_per_year: (extendedLimits.tokens_per_year || 0) - rolloverUsed.rolloverTokensUsed,
  };
}
