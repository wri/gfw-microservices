import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { ListLocationsRequest } from './model';

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

    return await SQLUtils.queryDB<Promise<unknown[]>>(
      databaseName,
      'uspGetListLocations',
      parameters
    );
  }
}
