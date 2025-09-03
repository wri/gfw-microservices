import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { SQL_CONFIG } from '../config/config';
import { OrganizationAnalysisUsageByAnalysisType as OrganizationAnalysisUsageResponseByAnalysisType } from '../queries/system/getOrganizationAnalysisUsageByAnalysisType';

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
  const usageByAnalysisType = await SQLUtils.queryDB<OrganizationAnalysisUsageResponseByAnalysisType>(
    orgDbName,
    'uspGetOrganizationAnalysisUsageByAnalysisType',
    parameters
  );
  console.log("usageByAnalysisType", usageByAnalysisType);
  // convert bigint values that DB returns as string back to number
  return usageByAnalysisType;
}
