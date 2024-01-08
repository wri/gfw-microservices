import moment from 'moment';
import { getAccountAnalysisUsage } from '@wri-monorepos/sql';
import { calculateAccountUsagePercentage } from '../utils';
import { getAccountLimits } from '../limits';

export async function getAccountUsagePercentage({
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

  return calculateAccountUsagePercentage(
    accountUsage.total_area_analyzed,
    accountLimits.MaxAreaAnalyzeablePerYear
  );
}
