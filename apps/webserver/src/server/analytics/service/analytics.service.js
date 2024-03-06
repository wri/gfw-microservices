const path = require('path');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const sql = require('mssql');
const { getOrganizationAnalysisUsage: getOrganizationAnalysisUsageQuery } = require(path.resolve(
  './queries/system/getOrganizationAnalysisUsage'
));
const { getAllListsAnalysisStatus: getAllListsAnalysisStatusQuery } = require(path.resolve(
  './queries/organization/getAllListsAnalysisStatus'
));
const { getListAnalysisStatusById } = require(path.resolve(
  './queries/organization/getListAnalysisStatusById'
));
// TODO: review all call sites and decide vs `getAccountAnalysisUsage` from 'wri-monorepos/sql`
// See: https://gfw.atlassian.net/browse/GPV-2660
const getOrganizationAnalysisUsage = async ({ startDate, endDate, organizationId }) => {
  const params = [
    { field: 'startDate', type: sql.NVarChar(255), value: startDate },
    { field: 'endDate', type: sql.NVarChar(255), value: endDate },
    { field: 'organization', type: sql.Int, value: organizationId || null },
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

module.exports = {
  getOrganizationAnalysisUsage,
  getAllListsAnalysisStatus,
  getListAnalysisStatusByListId,
};
