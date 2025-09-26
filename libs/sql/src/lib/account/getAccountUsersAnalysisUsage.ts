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
    // Format dates to include full day range
    const formattedStartDate = `${startDate}T00:00:00.000Z`;
    const formattedEndDate = `${endDate}T23:59:59.997Z`;

    const parameters = [
      { field: 'startDate', type: sql.NVarChar, value: formattedStartDate },
      { field: 'endDate', type: sql.NVarChar, value: formattedEndDate },
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
