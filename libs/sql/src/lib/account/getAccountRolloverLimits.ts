import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { OrganizationYearlyUsageSinceOrgActivation as OrganizationAllTimeAnalysisUsageResponse } from '../queries';

export async function getAccountYearlyUsageSinceActivation(
  orgDBName: string,
  { orgActivatedTime }
) {
  try {
    const parameters = [
      { field: 'orgActivatedTime', type: sql.NVarChar(100), value: orgActivatedTime },
    ];

    return await SQLUtils.queryDB<OrganizationAllTimeAnalysisUsageResponse>(
      orgDBName,
      'uspGetOrganizationYearlyUsageSinceOrgActivatedTime',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
