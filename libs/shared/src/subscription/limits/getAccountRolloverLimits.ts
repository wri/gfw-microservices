import { getAccountRenewalTime, getAccountYearlyUsageSinceActivation } from '@wri-monorepos/sql';
import moment = require('moment');
import { getAccountExtraLimits, getAccountSubscriptionLimits } from './getAccountLimits';
import { calculateRolloverUsed } from '../utils';

export interface AccountRolloverUsedParameters {
  orgDbName: string;
  organizationId: number;
  organizationType: number;
}

export async function getAccountRolloverLimits({ orgDbName, organizationId, organizationType }) {
  const orgActivatedTime = await getAccountRenewalTime(organizationId);
  const accountActivationDate = moment(orgActivatedTime);

  const yearlyUsageSinceActivation = await getAccountYearlyUsageSinceActivation(orgDbName, {
    orgActivatedTime: accountActivationDate.format('YYYY-MM-DD'),
  });

  const subscriptionLimits = await getAccountSubscriptionLimits(organizationType);
  const extendedLimits = await getAccountExtraLimits(organizationId);

  // RolloverUsed = for[y]yearlyUsageSinceActivation =- subscriptionLimits
  const rolloverUsed = calculateRolloverUsed(yearlyUsageSinceActivation, subscriptionLimits);

  // RolloverRemaining = extendedLimits - RolloverUsed
  return {
    analyzableAreaAvailable:
      extendedLimits.MaxAreaAnalyzeablePerYear - rolloverUsed.rolloverAnalysisAreaUsed,
    analyzableLocationsAvailable:
      extendedLimits.max_locations_per_year - rolloverUsed.rolloverLocationsUsed,
  };
}
