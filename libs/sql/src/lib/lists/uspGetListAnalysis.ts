import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { ListColumnsByIDRequest } from './model';
import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspGetListAnalysis {
  async run(
    databaseName: string,
    { listId: listID }: ListColumnsByIDRequest
  ): Promise<unknown[]> {
    const parameters = [{ field: 'list_id', type: sql.Int, value: listID }];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const recordsets = await connection.executeQueryArray<Promise<unknown[]>>(
        'uspGetListAnalysis',
        parameters
      );
      connection.disconnect();
      return recordsets;
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
