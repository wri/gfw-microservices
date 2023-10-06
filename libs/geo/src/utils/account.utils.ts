import { Logger } from '@nestjs/common';
import * as moment from 'moment';
import {
  UspGetOrganizationActivatedTime,
  UspGetOrganizationAnalysisUsage,
  UspGetAnalysisLimits,
  AnalysisLimit,
  OrganizationAnalysisUsage,
} from '@wri-monorepos/sql';

interface GetOrganizationAnalysisUsageFn {
  startDate: string;
  endDate: string;
  organizationId: number;
  countForEachList: number;
}
export async function getOrganizationAnalysisUsage({
  startDate,
  endDate,
  organizationId,
  countForEachList,
}: GetOrganizationAnalysisUsageFn) {
  Logger.log('Getting organization analysis usage');
  const organizationAnalysisUsageConn = new UspGetOrganizationAnalysisUsage();
  return await organizationAnalysisUsageConn.run(
    startDate,
    endDate,
    organizationId,
    countForEachList
  );
}

export async function getAccountActivatedTime(organizationId: number) {
  Logger.log('Getting organization activated time');
  const organizationActivatedTimeConn = new UspGetOrganizationActivatedTime();
  return await organizationActivatedTimeConn.run(organizationId);
}

export async function getAccountLimits(organizaitonId: number, organizationType: number) {
  Logger.log('Getting organization subscription limits');
  const organizationLimitsConn = new UspGetAnalysisLimits();
  const organizationCustomLimits = await organizationLimitsConn.run(organizaitonId);
  const organizationSubscriptionLimits = await organizationLimitsConn.run(organizationType);

  // If no custom limit found return the fallback by subscription_id
  return organizationCustomLimits || organizationSubscriptionLimits;
}

interface GetAccountProcessingLimitFn {
  organizationId: number;
  organizationType: number /* subscription_status_id */;
}
export async function getAccountListProccesingLimit({
  organizationId,
  organizationType /* subscription_status_id */,
}: GetAccountProcessingLimitFn) {
  const organizationActivatedTime = await getAccountActivatedTime(organizationId);

  const todayAsEndDay = moment();
  const accountActivationDate = moment(organizationActivatedTime);
  const accountLatestYearStartDate = todayAsEndDay.subtract(
    moment().diff(accountActivationDate, 'days') % 365,
    'days'
  );

  const [accountUsage] = await getOrganizationAnalysisUsage({
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

export function calculateProcessingLimit(
  accountLimits: AnalysisLimit,
  accountUsage: OrganizationAnalysisUsage
) {
  const availableAnalyzableAreaRemaining =
    accountLimits.MaxAreaAnalyzeablePerYear - accountUsage.total_area_analyzed;

  return Math.min(availableAnalyzableAreaRemaining, accountLimits.MaxAreaPerList);
}
