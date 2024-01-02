const path = require('path');
const moment = require('moment');
const { getOrganizationAnalysisUsage } = require('./analytics.service');

const { calculateRemainingUsage } = require(path.resolve('./config/privateutils/limits.utils'));

import { getAccountLimits } from '@wri-monorepos/subscription';

/**
 * @see Epic Analysis Usage Limits v2
 * {@link https://gfw.atlassian.net/browse/GPV-2228}
 */
module.exports = async ({ organizationId, subscriptionStatusId, organizationActivatedTime }) => {
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
  const [accountUsage] = await getOrganizationAnalysisUsage(accountUsageOptions);
  const accountLimits = await getAccountLimits(organizationId, subscriptionStatusId);

  return calculateRemainingUsage(accountLimits, accountUsage);
};
