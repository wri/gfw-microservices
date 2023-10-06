import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspGetOrganizationActivatedTime {
  async run(organizationId: number): Promise<string> {
    const parameters = [{ field: 'orgId', type: sql.Int, value: organizationId }];

    const connection = new SQLUtils({ ...SQL_CONFIG });
    await connection.connect();
    try {
      const recordsets = await connection.executeQuery<
        Promise<{
          OrganizationActivatedTime: string;
        }>
      >('uspGetOrganizationActivatedTime', parameters);
      connection.disconnect();
      const { OrganizationActivatedTime } = recordsets;
      return OrganizationActivatedTime;
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
