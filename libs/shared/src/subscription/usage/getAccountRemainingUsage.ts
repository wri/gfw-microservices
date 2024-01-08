import moment = require('moment');
import { getAccountAnalysisUsage } from '@wri-monorepos/sql';
import { calculateRemainingAreaUsage, calculateRemainingLocations } from '../utils';
import { getAccountLimits } from '../limits';

export async function getAccountRemainingUsage({
  organizationId,
  subscriptionStatusId,
  organizationActivatedTime,
}) {
  const todayAsEndDay = moment();
  const accountActivationDate = moment(organizationActivatedTime);
  const accountLatestYearStartDate = todayAsEndDay
    .clone()
    .subtract(moment().diff(accountActivationDate, 'days') % 365, 'days');
  const accountUsageOptions = {
    startDate: accountLatestYearStartDate.format('YYYY-MM-DD'),
    endDate: todayAsEndDay.format('YYYY-MM-DD'),
    organizationId,
    countForEachList: 0,
  };
  const accountUsage = await getAccountAnalysisUsage(accountUsageOptions);
  const accountLimits = await getAccountLimits(organizationId, subscriptionStatusId);

  return {
    remainingAvailableArea: calculateRemainingAreaUsage(accountLimits, accountUsage),
    remainingLocations: calculateRemainingLocations(accountLimits, accountUsage),
  };
}
