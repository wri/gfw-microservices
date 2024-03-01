import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { OrganizationRolloverLimitsAmount as OrganizationAllTimeAnalysisUsageResponse } from '../queries';

export async function getAccountRolloverLimits(orgDBName: string, orgId: number) {
  try {
    const parameters = [{ field: 'orgId', type: sql.Int, value: orgId }];

    return await SQLUtils.queryDBFirstRow<OrganizationAllTimeAnalysisUsageResponse>(
      orgDBName,
      'uspGetOrganizationRolloverLimitsAmounts',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
