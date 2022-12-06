import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspResetListStatus {
  async run(databaseName: string, listId: number, listStatusId, gfwListId) {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: listId },
      { field: 'status_id', type: sql.Int, value: listStatusId },
      { field: 'associated_gfwlist', type: sql.TinyInt, value: gfwListId },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      await connection.executeQuery('uspResetListStatus', parameters);
      connection.disconnect();
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
