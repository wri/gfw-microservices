import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { GenerationFileRequest, GetAnalysisDataCountForUserListResponse } from './model';
import { SQL_CONFIG } from '../config/config';

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
      searchString,
    } = filters;

    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'Country', type: sql.NVarChar, value: country || null },
      { field: 'State', type: sql.NVarChar, value: state || null },
      { field: 'SubState', type: sql.NVarChar, value: subState || null },
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
      { field: 'SearchString', type: sql.Float, value: searchString || null },
    ];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const recordsets =
        await connection.executeQueryArray<GetAnalysisDataCountForUserListResponse>(
          'uspGetAnalysisDataCountForUserList',
          parameters
        );

      const totalRows = recordsets.find(
        (record) => record.statistic_type === 'Row Count'
      ).statistic;
      const maximumAnalysisAreaInTheList = recordsets.find(
        (record) => record.statistic_type === 'Max Area'
      ).statistic;
      let numberOfPages = 2;
      if (totalRows) {
        numberOfPages = rowsPerPage ? Math.ceil(totalRows / rowsPerPage) : 1;
      }
      connection.disconnect();
      return {
        numberOfPages,
        numberOfResults: totalRows,
        maximumAnalysisAreaInTheList,
      };
    } catch (error) {
      console.log(error);
      connection.disconnect();
      throw new Error(error);
    }
  }
}
