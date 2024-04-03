import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import {
  GetOrganizationDatabaseType,
  OrganizationYearlyUsageSinceOrgActivation as OrganizationAllTimeAnalysisUsageResponse,
} from '../queries';
import { SQL_CONFIG } from '../config/config';

export async function getAccountYearlyUsageSinceActivation(
  organizationId: number,
  accountActivationDate: string
) {
  try {
    const { database: databaseName } = SQL_CONFIG;

    const { organizationDb } = await SQLUtils.queryDBFirstRow<GetOrganizationDatabaseType>(
      databaseName,
      'uspGetOrganizationDb',
      [{ field: 'organizationId', type: sql.Int, value: organizationId }]
    );

    const parameters = [
      { field: 'orgActivatedTime', type: sql.NVarChar(100), value: accountActivationDate },
    ];

    return await SQLUtils.queryDB<OrganizationAllTimeAnalysisUsageResponse[]>(
      organizationDb,
      'uspGetOrganizationYearlyUsageSinceOrgActivatedTime',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
