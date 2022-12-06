import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspDeleteLocation {
  async run(databaseName: string, listId: number, locationId: number) {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: listId },
      { field: 'location_id', type: sql.Int, value: locationId },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      await connection.executeQuery('uspDeleteLocation', parameters);
      connection.disconnect();
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
