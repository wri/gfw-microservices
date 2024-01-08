import moment from 'moment';
import { getAccountAnalysisUsage, getAccountActivatedTime } from '@wri-monorepos/sql';

import { getAccountLimits } from './getAccountLimits';
import { calculateListProcessingLimit } from '../utils';

interface GetAccountProcessingLimitFn {
  organizationId: number;
  organizationType: number /* subscription_status_id */;
}

export async function getListProcessingLimits({
  organizationId,
  organizationType,
}: GetAccountProcessingLimitFn) {
  const organizationActivatedTime = await getAccountActivatedTime(organizationId);

  const todayAsEndDay = moment();
  const accountActivationDate = moment(organizationActivatedTime);
  const accountLatestYearStartDate = todayAsEndDay.subtract(
    moment().diff(accountActivationDate, 'days') % 365,
    'days'
  );

  const accountUsage = await getAccountAnalysisUsage({
    startDate: accountLatestYearStartDate.format('YYYY-MM-DD'),
    endDate: todayAsEndDay.format('YYYY-MM-DD'),
    organizationId,
    countForEachList: 0,
  });
  const accountLimits = await getAccountLimits(organizationId, organizationType);

  // Calculate Processing limit either left for the year or max limit per list
  return calculateListProcessingLimit(accountLimits, accountUsage);
}
