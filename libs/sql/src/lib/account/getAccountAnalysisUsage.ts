import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { SQL_CONFIG } from '../config/config';
import { OrganizationAnalysisUsage as OrganizationAnalysisUsageResponse } from '../queries/system/getOrganizationAnalysisUsage';

interface GetAccountAnalysisUsage {
  startDate: string;
  endDate: string;
  organizationId: number;
  countForEachList: number;
}
export async function getAccountAnalysisUsage({
  startDate,
  endDate,
  organizationId,
  countForEachList,
}: GetAccountAnalysisUsage) {
  try {
    const { database: databaseName } = SQL_CONFIG;
    const parameters = [
      { field: 'startDate', type: sql.NVarChar, value: startDate },
      { field: 'endDate', type: sql.NVarChar, value: endDate },
      { field: 'organization', type: sql.Int, value: organizationId },
      { field: 'countForEachList', type: sql.Int, value: countForEachList },
    ];
    return SQLUtils.queryDB<OrganizationAnalysisUsageResponse>(
      databaseName,
      'getOrganizationAnalysisUsagePerUser',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
