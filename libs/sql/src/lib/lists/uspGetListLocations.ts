import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { ListLocationsRequest } from './model';
import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspGetListLocations {
  async run(
    databaseName: string,
    { listID, locationID, rowsRequested }: ListLocationsRequest
  ): Promise<unknown[]> {
    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'locationID', type: sql.Int, value: locationID },
      {
        field: 'rowsRequested',
        type: sql.Int,
        value: rowsRequested,
      },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const recordsets = await connection.executeQuery<Promise<unknown[]>>(
        'uspGetListLocations',
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
