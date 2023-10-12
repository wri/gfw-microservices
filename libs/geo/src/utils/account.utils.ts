import { Logger } from '@nestjs/common';
import * as moment from 'moment';
import {
  AnalysisLimit,
  OrganizationAnalysisUsage,
  getAccountAnalysisLimits,
  getAccountAnalysisUsage,
  getAccountActivatedTime,
} from '@wri-monorepos/sql';
/**
 * @see {@link https://gfw.atlassian.net/browse/GPV-2329}
 * @TODO make available for webserver
 * @TODO remove from {@path apps/webserver/src/server/analytics/service/analytics.service.js:75}
 * */
export async function getAccountLimits(organizationId: number, organizationType: number) {
  const organizationCustomLimits = await getAccountAnalysisLimits({ organizationId });
  const organizationSubscriptionLimits = await getAccountAnalysisLimits({ organizationType });

  // If no custom limit found, return the fallback by subscription_id
  return organizationCustomLimits || organizationSubscriptionLimits;
}
/**
 * @see {@link https://gfw.atlassian.net/browse/GPV-2329}
 * @TODO make available for webserver
 * @TODO remove from {@path apps/webserver/src/server/analytics/service/analytics.service.js:75}
 * */
interface GetAccountProcessingLimitFn {
  organizationId: number;
  organizationType: number /* subscription_status_id */;
}
export async function getAccountListProccesingLimit({
  organizationId,
  organizationType /* subscription_status_id */,
}: GetAccountProcessingLimitFn) {
  Logger.log('Calculating organization processing limits');

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
  const processingLimit = calculateProcessingLimit(accountLimits, accountUsage);

  return processingLimit;
}
/**
 * @see {@link https://gfw.atlassian.net/browse/GPV-2329}
 * @TODO make available for webserver
 * @TODO remove from {@path config/privateutils/limits.utils}
 */
export function calculateProcessingLimit(
  accountLimits: AnalysisLimit,
  accountUsage: OrganizationAnalysisUsage
) {
  const availableAnalyzableAreaRemaining =
    accountLimits.MaxAreaAnalyzeablePerYear - accountUsage.total_area_analyzed;

  return Math.min(availableAnalyzableAreaRemaining, accountLimits.MaxAreaPerList);
}
