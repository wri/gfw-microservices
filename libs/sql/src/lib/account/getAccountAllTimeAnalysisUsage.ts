import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { OrganizationRolloverLimitsAmount as OrganizationAllTimeAnalysisUsageResponse } from '../queries';
import { SQL_CONFIG } from '../config/config';

export async function getAccountRolloverLimits(orgId: number) {
  try {
    const { database: databaseName } = SQL_CONFIG;

    const parameters = [{ field: 'orgId', type: sql.Int, value: orgId }];

    return await SQLUtils.queryDBFirstRow<OrganizationAllTimeAnalysisUsageResponse>(
      databaseName,
      'uspGetOrganizationRolloverLimitsAmounts',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
