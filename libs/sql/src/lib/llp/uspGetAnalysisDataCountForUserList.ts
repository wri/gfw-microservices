import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { GenerationFileRequest, GetAnalysisDataCountForUserListResponse } from './model';

@Injectable()
export class UspGetAnalysisDataCountForUserList {

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
      country,
      listID,
      state,
      subState,
      rowsPerPage,
    } =  filters;

    const parameters = [
      { field: 'listID', type: sql.Int, value: listID},
      { field: 'Country', type: sql.NVarChar, value: country || null },
      { field: 'State', type: sql.NVarChar, value: state || null },
      { field: 'SubState', type: sql.NVarChar, value: subState || null },
    ];

    const connection = new SQLUtils(sqlConfig);
    await connection.connect();
    try {
      const recordsets = await connection.executeQuery<GetAnalysisDataCountForUserListResponse>(
        'uspGetAnalysisDataCountForUserList',
        parameters
      );
      const numberOfPages = Math.ceil(recordsets.TotalRows / rowsPerPage);
      connection.disconnect();
      return numberOfPages;
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
