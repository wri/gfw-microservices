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
  try {
    const { database: databaseName } = SQL_CONFIG;
    const parameters = [
      { field: 'startDate', type: sql.NVarChar(255), value: startDate },
      { field: 'endDate', type: sql.NVarChar(255), value: endDate },
      { field: 'organization', type: sql.Int, value: organizationId },
    ];
    return SQLUtils.queryDBFirstRow<OrganizationAnalysisUsageResponse>(
      databaseName,
      'uspGetOrganizationAnalysisUsage',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
