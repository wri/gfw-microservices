import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspSetListLocked {
  async run(databaseName: string, listId: number, userId) {
    console.log('userid', userId);
    const parameters = [
      { field: 'list_id', type: sql.Int, value: listId },
      {
        field: 'user_id',
        type: sql.Int,
        value: userId,
      },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      await connection.executeQuery('uspSetListLocked', parameters);
      connection.disconnect();
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
