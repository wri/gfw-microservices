import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { GenerationFileRequest, GetAnalysisDataCountForUserListResponse } from './model';
import { SQL_CONFIG } from './config';

@Injectable()
export class UspGetAnalysisDataCountForUserList {

  async run(databaseName: string, filters: GenerationFileRequest) {

    const {
      country,
      listID,
      state,
      subState,
      rowsPerPage,
      analysisAreaMin,
      analysisAreaMax,
      analysisArea,
      analysisAreaOperator
    } =  filters;

    const parameters = [
      { field: 'listID', type: sql.Int, value: listID},
      { field: 'Country', type: sql.NVarChar, value: country || null },
      { field: 'State', type: sql.NVarChar, value: state || null },
      { field: 'SubState', type: sql.NVarChar, value: subState || null },
      { field: 'AnalysisAreaMin', type: sql.Int, value: analysisAreaMin || null },
      { field: 'AnalysisAreaMax', type: sql.Int, value: analysisAreaMax || null },
      { field: 'AnalysisAreaFilter', type: sql.Float, value: analysisArea || null },
      { field: 'AnalysisAreaOperator', type: sql.NVarChar, value: analysisAreaOperator || '>' },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      console.log(parameters);
      const recordsets = await connection.executeQuery<GetAnalysisDataCountForUserListResponse>(
        'uspGetAnalysisDataCountForUserList',
        parameters
      );
      console.log(recordsets);
      const numberOfPages = Math.ceil(recordsets.TotalRows / rowsPerPage);
      connection.disconnect();
      return numberOfPages;
    } catch (error) {
      console.log(error);
      connection.disconnect();
      throw new Error(error);
    }
  }
}
