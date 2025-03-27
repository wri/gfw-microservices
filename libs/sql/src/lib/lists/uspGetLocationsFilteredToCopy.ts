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
      searchString,
    }
  ): Promise<unknown[]> {
    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      {
        field: 'SelectedLocations',
        type: sql.VarChar,
        value: selectedLocations,
      },
      { field: 'Country', type: sql.NVarChar(255), value: country || null },
      { field: 'State', type: sql.NVarChar(255), value: state || null },
      { field: 'SubState', type: sql.NVarChar(255), value: subState || null },
      {
        field: 'AnalysisAreaMin',
        type: sql.Int,
        value: analysisAreaMin || null,
      },
      {
        field: 'AnalysisAreaMax',
        type: sql.Int,
        value: analysisAreaMax || null,
      },
      {
        field: 'SearchString',
        type: sql.NVarChar(255),
        value: searchString || null,
      },

      {
        field: 'OrderByColumn',
        type: sql.NVarChar(255),
        value: 'Location Name',
      },
      {
        field: 'Order',
        type: sql.NVarChar(255),
        value: 'ASC',
      },
      {
        field: 'Geometry',
        type: sql.Bit,
        value: 1,
      },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const result = (await connection.executeQuery(
        'uspGetLocationsFilteredToCopy',
        parameters
      )) as unknown[];
      connection.disconnect();
      if (Array.isArray(result) && result.length > 0) {
        return result;
      }
      return [result];
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
