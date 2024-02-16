import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { OrganizationUsersAnalysisUsageExport as OrganizationUsersAnalysisUsageExportResponse } from '../queries';

interface GetAccountUsersAnalysisUsageParameters {
  startDate: string;
  endDate: string;
}
export async function getAccountUsersAnalysisUsageExport(
  orgDbName: string,
  { startDate, endDate }: GetAccountUsersAnalysisUsageParameters
) {
  try {
    const parameters = [
      { field: 'startDate', type: sql.NVarChar, value: startDate },
      { field: 'endDate', type: sql.NVarChar, value: endDate },
    ];

    return await SQLUtils.queryDB<OrganizationUsersAnalysisUsageExportResponse[]>(
      orgDbName,
      'uspGetOrganizationUsersUsageExport',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
