const path = require('path');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const sql = require('mssql');
const { getOrganizationAnalysisUsage } = require(path.resolve(
  './queries/system/getOrganizationAnalysisUsage'
));

exports.getOrganizationAnalysisUsage = async ({
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

  const [response] = await sqlUtils.executeSystemQuery(getOrganizationAnalysisUsage, params);

  const result = response.reduce((acc, value) => {
    value.total_area_analyzed = value.total_area_analyzed ?? 0;
    value.max_area_analyzed = value.max_area_analyzed ?? 0;
    acc.push(value);
    return acc;
  }, []);

  return result;
};
