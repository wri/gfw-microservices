import {
  AnalysisLimit,
  getAccountRenewalTime,
  getAccountYearlyUsageSinceActivation,
} from '@wri-monorepos/sql';
import { calculateRolloverUsed } from '../utils';
import moment = require('moment');

export async function getAccountRolloverLimits(
  organizationId: number,
  subscriptionLimits: AnalysisLimit,
  extendedLimits: AnalysisLimit
) {
  const orgRenewalTime = await getAccountRenewalTime(organizationId);
  const accountRenewalMoment = moment(orgRenewalTime);
  const yearlyUsageSinceActivation = await getAccountYearlyUsageSinceActivation(
    organizationId,
    accountRenewalMoment.format('YYYY-MM-DD')
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
      extendedLimits.MaxAreaAnalyzeablePerYear - rolloverUsed.rolloverAnalysisAreaUsed,
    MaxAreaPerList: extendedLimits.MaxAreaPerList,
    max_locations_per_year:
      extendedLimits.max_locations_per_year - rolloverUsed.rolloverLocationsUsed,
  };
}
