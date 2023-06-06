import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspSetListUnlocked {
  async run(databaseName: string, list_id: number) {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'user_id', type: sql.NVarChar(150), value: undefined },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const recordsets = await connection.executeQuery('uspSetListUnlocked', parameters);
      connection.disconnect();
      return recordsets;
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
