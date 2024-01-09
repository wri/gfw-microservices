import moment = require('moment');
import { getAccountAnalysisUsage, getAccountActivatedTime } from '@wri-monorepos/sql';
import { getAccountLimits } from '../limits';

export async function getAccountSubscriptionData({
  organizationId,
  subscriptionStatusId,
}: {
  organizationId: number;
  subscriptionStatusId: number;
}) {
  const organizationActivatedTime = await getAccountActivatedTime(organizationId);
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
    accountUsage,
    accountLimits,
    organizationActivatedTime,
  };
}
