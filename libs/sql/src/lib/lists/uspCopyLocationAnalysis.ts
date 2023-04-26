import { SQLUtils } from '../util/sql.utils';
import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';

import { CopyLocationRequest } from './model';
import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspCopyLocationAnalysis {
  async run(
    databaseName: string,
    {
      desListId,
      destLocationId,
      srcListId,
      srcLocationId,
      statement,
    }: CopyLocationRequest
  ): Promise<void> {
    const parameters = [
      { field: 'dest_list_id', type: sql.Int, value: desListId },
      { field: 'dest_location_id', type: sql.Int, value: destLocationId },
      { field: 'src_list_id', type: sql.Int, value: srcListId },
      { field: 'src_location_id', type: sql.Int, value: srcLocationId },
      {
        field: 'statement',
        type: sql.VarChar,
        value: statement,
      },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      await connection.executeQuery<Promise<unknown[]>>(
        'uspCopyLocationAnalysis',
        parameters
      );
      connection.disconnect();
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
