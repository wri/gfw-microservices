import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { SQL_CONFIG } from '../config/config';
import { OrganizationAnalysisUsage as OrganizationAnalysisUsageResponse } from '../queries/system/getOrganizationAnalysisUsage';

interface GetAccountAnalysisUsage {
  startDate: string;
  endDate: string;
  organizationId: number;
}
export async function getAccountAnalysisUsage({
  startDate,
  endDate,
  organizationId,
}: GetAccountAnalysisUsage) {
  const { database: databaseName } = SQL_CONFIG;
  const parameters = [
    { field: 'startDate', type: sql.NVarChar(255), value: startDate },
    { field: 'endDate', type: sql.NVarChar(255), value: endDate },
    { field: 'organization', type: sql.Int, value: organizationId },
  ];
  const usageDataBigintAsString = await SQLUtils.queryDB<OrganizationAnalysisUsageResponse[]>(
    databaseName,
    'uspGetOrganizationAnalysisUsage',
    parameters
  );
  // convert bigint values that DB returns as string back to number
  return usageDataBigintAsString.map((item) => ({
    ...item,
    total_area_analyzed: Number(item.total_area_analyzed),
    max_area_analyzed: Number(item.max_area_analyzed),
  }));
}
