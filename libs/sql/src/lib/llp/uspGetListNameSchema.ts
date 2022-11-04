import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { GenerationFileRequest , ListNameSchema  } from './model';

@Injectable()
export class UspGetListNameSchema {

  async run(databaseName: string, filters: GenerationFileRequest) {

    const sqlConfig = {
      user: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      database: databaseName,
      server: process.env.MSSQL_HOSTNAME,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      port: parseInt(process.env.MSSQL_PORT),
      options: {
        trustServerCertificate: true,
      },
    };

    const {
      listID,
    } =  filters;

    const parameters = [
      { field: 'list_id', type: sql.Int, value: listID},
    ];

    const connection = new SQLUtils(sqlConfig);
    await connection.connect();
    try {
      const recordsets = await connection.executeQuery<ListNameSchema>(
        'uspGetListNameSchema',
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
