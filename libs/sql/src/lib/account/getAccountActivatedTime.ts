import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { SQL_CONFIG } from '../config/config';

export async function getAccountActivatedTime(organizationId: number) {
  try {
    const { database: databaseName } = SQL_CONFIG;
    const parameters = [{ field: 'orgId', type: sql.Int, value: organizationId }];
    const recordset = await SQLUtils.queryDB<{ OrganizationActivatedTime: string }>(
      databaseName,
      'uspGetOrganizationActivatedTime',
      parameters
    );
    const { OrganizationActivatedTime } = recordset;
    return OrganizationActivatedTime;
  } catch (error) {
    throw new Error(error);
  }
}
