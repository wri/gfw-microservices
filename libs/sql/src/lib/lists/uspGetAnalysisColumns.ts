import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { ListColumnsByIDRequest } from './model';
import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspGetAnalysisColumns {
  async run(
    databaseName: string,
    { listId }: ListColumnsByIDRequest
  ): Promise<unknown[]> {
    const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const recordsets = await connection.executeQuery<Promise<unknown[]>>(
        'uspGetAnalysisColumns',
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
