import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { GenerationFileRequest } from './model';
import { SQL_CONFIG } from './config'

@Injectable()
export class UspGetPaginatedAnalysisDataForUserList {

  async run(databaseName: string, filters: GenerationFileRequest) {


    const {
      analysisArea,
      analysisAreaOperator,
      country,
      geometry,
      listID,
      orderType,
      page,
      pageSize,
      sortByAttribute,
      state,
      subState,
    } = filters;

    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'PageNumber', type: sql.Int, value: page || 1 },
      { field: 'RowsOfPage', type: sql.Int, value: pageSize || 100 },
      { field: 'OrderByColumn', type: sql.NVarChar, value: sortByAttribute || '[Location Name]' },
      { field: 'Order', type: sql.NVarChar, value: orderType || 'asc' },
      { field: 'Country', type: sql.NVarChar, value: country || null },
      { field: 'State', type: sql.NVarChar, value: state || null },
      { field: 'SubState', type: sql.NVarChar, value: subState || null },
      { field: 'AnalysisAreaFilter', type: sql.Float, value: analysisArea || null },
      { field: 'AnalysisAreaOperator', type: sql.NVarChar, value: analysisAreaOperator || '>' },
      { field: 'Geometry', type: sql.Bit, value: geometry || 0 },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const createListResult = await connection.executeQueryArray<any>(
        'uspGetPaginatedAnalysisDataForUserList',
        parameters
      );
      connection.disconnect();
      return createListResult;
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }

  }
}
