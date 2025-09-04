import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { OrganizationAnalysisUsageByAnalysisType as OrganizationAnalysisUsageResponseByAnalysisType } from '../queries/organization/getOrganizationAnalysisUsageByAnalysisType';

interface GetAccountAnalysisUsageByAnalysisType {
  startDate: string;
  endDate: string;
  orgDbName: string;
}
export async function getAccountAnalysisUsageByAnalysisType({
  startDate,
  endDate,
  orgDbName,
}: GetAccountAnalysisUsageByAnalysisType) {
  const parameters = [
    { field: 'startDate', type: sql.NVarChar(255), value: startDate },
    { field: 'endDate', type: sql.NVarChar(255), value: endDate },
  ];
  return await SQLUtils.queryDB<OrganizationAnalysisUsageResponseByAnalysisType>(
    orgDbName,
    'uspGetOrganizationAnalysisUsageByAnalysisType',
    parameters
  );
}
