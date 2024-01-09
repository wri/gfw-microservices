const path = require('path');
const moment = require('moment');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const sql = require('mssql');
const { getOrganizationAnalysisUsage: getOrganizationAnalysisUsageQuery } = require(path.resolve(
  './queries/system/getOrganizationAnalysisUsage'
));
const { getAnalysisLimits } = require(path.resolve('./queries/system/getAnalysisLimits'));
const { getAllListsAnalysisStatus: getAllListsAnalysisStatusQuery } = require(path.resolve(
  './queries/organization/getAllListsAnalysisStatus'
));
const { getListAnalysisStatusById } = require(path.resolve(
  './queries/organization/getListAnalysisStatusById'
));
const { calculateProcessingLimit, calculateAccountUsagePercentage } = require(path.resolve(
  './config/privateutils/limits.utils'
));

const MAX_LOCATIONS_PER_YEAR = 20000;

const getOrganizationAnalysisUsage = async ({
  startDate,
  endDate,
  organizationId,
  countForEachList,
}) => {
  const params = [
    { field: 'startDate', type: sql.NVarChar, value: startDate },
    { field: 'endDate', type: sql.NVarChar, value: endDate },
    { field: 'organization', type: sql.Int, value: organizationId },
    { field: 'countForEachList', type: sql.Int, value: countForEachList },
  ];

  const [response] = await sqlUtils.executeSystemQuery(getOrganizationAnalysisUsageQuery, params);

  const result = response.reduce((acc, value) => {
    value.total_area_analyzed = value.total_area_analyzed ?? 0;
    value.max_area_analyzed = value.max_area_analyzed ?? 0;
    acc.push(value);
    return acc;
  }, []);

  return result;
};

const getAnalysisLimitData = async ({ organizationId = null, organizationType = null }) => {
  const params = [
    { field: 'orgID', type: sql.Int, value: organizationId },
    { field: 'orgType', type: sql.Int, value: organizationType },
  ];

  const [response] = await sqlUtils.executeSystemQuery(getAnalysisLimits, params);

  return response;
};
/**
 * @seen also {@path libs/geo/src/utils/account.utils.ts}
 * */
const getAccountLimits = async (organizationId, organizationType) => {
  const [limitsByOrgID] = await getAnalysisLimitData({ organizationId });
  const [limitsByOrgType] = await getAnalysisLimitData({ organizationType });

  const accountLimits = limitsByOrgID || limitsByOrgType;

  if (accountLimits < MAX_LOCATIONS_PER_YEAR) {
    throw new Error('Analysis limit reached');
  }

  // If no custom limit found return the fallback by subscription_id
  return accountLimits;
};
/**
 * @seen also {@path libs/geo/src/utils/account.utils.ts}
 * */
const getAccountListProccesingLimit = async ({
  organization_id,
  subscription_status_id,
  OrganizationActivatedTime,
}) => {
  const todayAsEndDay = moment();
  const accountActivationDate = moment(OrganizationActivatedTime);
  const accountLatestYearStartDate = todayAsEndDay.subtract(
    moment().diff(accountActivationDate, 'days') % 365,
    'days'
  );

  const [accountUsage] = await getOrganizationAnalysisUsage({
    startDate: accountLatestYearStartDate.format('YYYY-MM-DD'),
    endDate: todayAsEndDay.format('YYYY-MM-DD'),
    organizationId: organization_id,
    countForEachList: 0,
  });
  const accountLimits = await getAccountLimits(organization_id, subscription_status_id);

  // Calculate Processing limit either left for the year or max limit per list
  const processingLimit = calculateProcessingLimit(accountLimits, accountUsage);

  return processingLimit;
};

const getAllListsAnalysisStatus = async (req) => {
  const [response] = await sqlUtils.executeOrganizationQuery(req, getAllListsAnalysisStatusQuery);
  return response;
};

const getListAnalysisStatusByListId = async (req, listId) => {
  const params = [{ field: 'ListID', type: sql.Int, value: listId }];
  const [response] = await sqlUtils.executeOrganizationQuery(
    req,
    getListAnalysisStatusById,
    params
  );
  return response;
};

const getOrganizationUsagePercentage = async ({
  organizationId,
  organizationType,
  organizationActivatedTime,
}) => {
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

  const usagePercentage = calculateAccountUsagePercentage(
    accountUsage.total_area_analyzed,
    accountLimits.MaxAreaAnalyzeablePerYear
  );

  return usagePercentage;
};

module.exports = {
  getOrganizationAnalysisUsage,
  getAnalysisLimitData,
  getAccountLimits,
  getAllListsAnalysisStatus,
  getAccountListProccesingLimit,
  getListAnalysisStatusByListId,
  getOrganizationUsagePercentage,
};
