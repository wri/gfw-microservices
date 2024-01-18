import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { OrganizationUsersAnalysisUsage as OrganizationUsersAnalysisUsageResponse } from '../queries';
interface GetAccountUsersAnalysisUsageParameters {
  startDate: string;
  endDate: string;
}
export async function getAccountUsersAnalysisUsage(
  orgDbName: string,
  { startDate, endDate }: GetAccountUsersAnalysisUsageParameters
) {
  try {
    const parameters = [
      { field: 'startDate', type: sql.NVarChar, value: startDate },
      { field: 'endDate', type: sql.NVarChar, value: endDate },
    ];

    return await SQLUtils.queryDB<[OrganizationUsersAnalysisUsageResponse]>(
      orgDbName,
      'uspGetOrganizationUsersAnalysisUsage',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
