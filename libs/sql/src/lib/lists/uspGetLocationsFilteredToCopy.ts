import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { GetLocationsCopyMoveType, getLocationsFilteredToCopy } from '../queries';

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
      locationLogic,
      columnsToReturn,
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
        field: 'LocationLogic',
        type: sql.NVarChar(255),
        value: locationLogic || null,
      },
      {
        field: 'ColumnsToReturn',
        type: sql.NVarChar(255),
        value: columnsToReturn || null,
      },
      {
        field: 'LocationStatement',
        type: sql.NVarChar(255),
        value: null,
      },
      {
        field: 'LocationIds',
        type: sql.NVarChar(255),
        value: null,
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

    const result = await SQLUtils.queryDB<GetLocationsCopyMoveType>(
      databaseName,
      getLocationsFilteredToCopy,
      parameters
    );

    return [result];
  }
}
