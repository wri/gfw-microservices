import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { SQL_CONFIG } from '../config/config';
import { OrganizationUsersAnalysisUsage as OrganizationUsersAnalysisUsageResponse } from '../queries/system/getOrganizationUsersAnalysisUsage';
interface GetAccountUsersAnalysisUsage {
  organizationId: number;
  startDate: string;
  endDate: string;
}
export async function getAccountUsersAnalysisUsage({
  organizationId,
  startDate,
  endDate,
}: GetAccountUsersAnalysisUsage) {
  try {
    const { database: databaseName } = SQL_CONFIG;
    const parameters = [
      { field: 'startDate', type: sql.NVarChar, value: startDate },
      { field: 'endDate', type: sql.NVarChar, value: endDate },
      { field: 'organizationId', type: sql.Int, value: organizationId },
    ];

    return await SQLUtils.queryDBArray<[OrganizationUsersAnalysisUsageResponse]>(
      databaseName,
      'uspGetOrganizationUsersAnalysisUsage',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
