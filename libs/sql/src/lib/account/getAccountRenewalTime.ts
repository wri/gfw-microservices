import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { SQL_CONFIG } from '../config/config';

export async function getAccountRenewalTime(organizationId: number) {
  try {
    const { database: databaseName } = SQL_CONFIG;
    const parameters = [{ field: 'orgId', type: sql.Int, value: organizationId }];
    const recordset = await SQLUtils.queryDBFirstRow<{ orgRenewalTime: string }>(
      databaseName,
      'uspGetOrganizationRenewalTime',
      parameters
    );
    const { orgRenewalTime } = recordset;
    return orgRenewalTime;
  } catch (error) {
    throw new Error(error);
  }
}
