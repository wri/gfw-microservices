const path = require('path');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const sql = require('mssql');
const { getOrganizationAnalysisUsage: getOrganizationAnalysisUsageQuery } = require(path.resolve(
  './queries/system/getOrganizationAnalysisUsage'
));
const { getAnalysisLimits } = require(path.resolve('./queries/system/getAnalysisLimits'));
const { getAllListsAnalysisStatus: getAllListsAnalysisStatusQuery } = require(path.resolve(
  './queries/organization/getAllListsAnalysisStatus'
));

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

const getAnalysisLimitData = async ({ organizationId, organizationType }) => {
  const params = [
    { field: 'orgID', type: sql.Int, value: organizationId },
    { field: 'orgType', type: sql.Int, value: organizationType },
  ];

  const [response] = await sqlUtils.executeSystemQuery(getAnalysisLimits, params);

  return response;
};

const getAccountLimits = async (organizationId, organizationType) => {
  const [limitsByOrgID] = await getAnalysisLimitData({ organizationId });
  const [limitsByOrgType] = await getAnalysisLimitData({ organizationType });

  // If no custom limit found return the fallback by subscription_id
  return limitsByOrgID || limitsByOrgType;
};

const getAllListsAnalysisStatus = async (req) => {
  const [response] = await sqlUtils.executeOrganizationQuery(req, getAllListsAnalysisStatusQuery);
  return response;
};

module.exports = {
  getOrganizationAnalysisUsage,
  getAnalysisLimitData,
  getAccountLimits,
  getAllListsAnalysisStatus,
};
