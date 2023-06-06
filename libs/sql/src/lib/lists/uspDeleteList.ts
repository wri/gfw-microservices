import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspDeleteList {
  async run(databaseName: string, listName: string, listTable: string, listAnalysisTable) {
    const parameters = [
      { field: 'list_name', type: sql.NVarChar(150), value: listName },
      { field: 'list_table', type: sql.NVarChar(150), value: listTable },
      {
        field: 'analysis_table',
        type: sql.NVarChar(150),
        value: listAnalysisTable,
      },
    ];
    console.log(parameters);
    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      await connection.executeQuery('uspDeleteList', parameters);
      connection.disconnect();
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
