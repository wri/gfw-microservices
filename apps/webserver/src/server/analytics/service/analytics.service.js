
const path = require('path');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const sql = require('mssql');
const { getOrganizationAnalysisUsage } = require(path.resolve('./queries/system/getOrganizationAnalysisUsage'));

exports.getOrganizationAnalysisUsage = async ({
  startDate,
  endDate,
  orgId,
  listLevel,
}) => {

  const params = [
    { field: 'startDate', type: sql.NVarChar, value: startDate },
    { field: 'endDate', type: sql.NVarChar, value: endDate },
    { field: 'organization', type: sql.Int, value: orgId },
    { field: 'listLevel', type: sql.Int, value: listLevel },
  ]

  const [response] = await sqlUtils.executeSystemQuery(getOrganizationAnalysisUsage, params)

  const result = response.reduce((acc, value) => {
    value.total_area_analysis = value.total_area_analysis ?? 0
    value.max_analyzed_location = value.max_analyzed_location ?? 0
    acc.push(value)
    return acc;
  },[])

  return result;
}
