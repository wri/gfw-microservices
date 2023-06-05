import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { GenerationFileRequest, ListNameSchema } from './model';
import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspGetListNameSchema {
  async run(databaseName: string, filters: GenerationFileRequest): Promise<ListNameSchema> {
    const { listID } = filters;

    const parameters = [{ field: 'list_id', type: sql.Int, value: listID }];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const recordsets = await connection.executeQuery<ListNameSchema>(
        'uspGetListNameSchema',
        parameters
      );
      connection.disconnect();
      return recordsets as ListNameSchema;
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
