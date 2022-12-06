import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspUpdateListCount {
  async run(databaseName: string, tableName: string, listId: number) {
    const parameters = [
      {
        field: 'table_name',
        type: sql.NVarChar(150),
        value: tableName,
      },
      { field: 'list_id', type: sql.Int, value: listId },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      await connection.executeQuery('uspUpdateListCount', parameters);
      connection.disconnect();
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
