import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { SQL_CONFIG } from '../config/config';

@Injectable()
export class UspGetLocationsFilteredToCopy {
  async run(
    databaseName: string,
    {
      listID,
      selectedLocations,
      country,
      state,
      subState,
      analysisAreaMin,
      analysisAreaMax,
    }
  ): Promise<unknown[]> {
    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      {
        field: 'SelectedLocations',
        type: sql.VarChar,
        value: selectedLocations,
      },
      { field: 'Country', type: sql.NVarChar, value: country || null },
      { field: 'State', type: sql.NVarChar, value: state || null },
      { field: 'SubState', type: sql.NVarChar, value: subState || null },
      {
        field: 'analysisAreaMin',
        type: sql.Int,
        value: analysisAreaMin || null,
      },
      {
        field: 'analysisAreaMax',
        type: sql.Int,
        value: analysisAreaMax || null,
      },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const recordsets = await connection.executeQueryArray<Promise<unknown[]>>(
        'uspGetLocationsFilteredToCopy',
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
