import {
  AnalysisLimit,
  getAccountRenewalTime,
  getAccountYearlyUsageSinceActivation,
} from '@wri-monorepos/sql';
import { calculateRolloverUsed } from '../utils';
import { format as formatDate } from 'date-fns';

export async function getAccountRolloverLimits(
  organizationId: number,
  subscriptionLimits: AnalysisLimit,
  extendedLimits: AnalysisLimit
) {
  const orgRenewalTime = await getAccountRenewalTime(organizationId);
  const accountRenewalMoment = new Date(orgRenewalTime);
  const yearlyUsageSinceActivation = await getAccountYearlyUsageSinceActivation(
    organizationId,
    formatDate(accountRenewalMoment, 'yyyy-MM-dd')
  );

  // RolloverUsed = for[y]yearlyUsageSinceActivation =- subscriptionLimits
  const rolloverUsed = calculateRolloverUsed(
    yearlyUsageSinceActivation,
    subscriptionLimits,
    accountRenewalMoment
  );

  // RolloverRemaining = extendedLimits - RolloverUsed
  return {
    MaxAreaAnalyzeablePerYear:
      (extendedLimits.MaxAreaAnalyzeablePerYear ?? 0) - rolloverUsed.rolloverAnalysisAreaUsed,
    MaxAreaPerList: extendedLimits.MaxAreaPerList,
    max_locations_per_year:
      (extendedLimits.max_locations_per_year ?? 0) - rolloverUsed.rolloverLocationsUsed,
  };
}
