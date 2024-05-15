import moment = require('moment');
import { getAccountAnalysisUsage, getAccountRenewalTime } from '@wri-monorepos/sql';
import { getAccountLimits } from '../limits';

export async function getAccountSubscriptionData({
  organizationId,
  subscriptionStatusId,
}: {
  organizationId: number;
  subscriptionStatusId: number;
}) {
  const organizationRenewalTime = await getAccountRenewalTime(organizationId);
  const todayAsEndDay = moment().add(1, 'day');
  const accountActivationDate = moment(organizationRenewalTime);
  const accountLatestYearStartDate = todayAsEndDay
    .clone()
    .subtract(moment().diff(accountActivationDate, 'days') % 365, 'days');

  const accountUsageOptions = {
    startDate: accountLatestYearStartDate.format('YYYY-MM-DD'),
    endDate: todayAsEndDay.format('YYYY-MM-DD'),
    organizationId,
  };

  const [accountUsage] = await getAccountAnalysisUsage(accountUsageOptions);
  const accountLimits = await getAccountLimits(organizationId, subscriptionStatusId);

  return {
    accountUsage,
    accountLimits,
    organizationRenewalTime,
  };
}
