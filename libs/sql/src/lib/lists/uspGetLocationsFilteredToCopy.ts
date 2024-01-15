import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

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
    ];

    return await SQLUtils.queryDB<Promise<unknown[]>>(
      databaseName,
      'uspGetLocationsFilteredToCopy',
      parameters
    );
  }
}
