import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { GenerationFileRequest } from './model';
import { SQL_CONFIG } from '../config/config';
import {
  AnalysisDataCountType,
  getAnalysisDataCountForGFWList,
  getAnalysisDataCountForUserList,
} from '../queries';

export interface AnalysisDataCountReturnType {
  numberOfPages: number;
  numberOfResults: number;
  maximumAnalysisAreaInTheList: number;
}

@Injectable()
export class UspGetAnalysisDataCountForUserList {
  async run(
    databaseName: string,
    filters: GenerationFileRequest
  ): Promise<AnalysisDataCountReturnType> {
    const {
      country,
      listID,
      state,
      subState,
      rowsPerPage,
      analysisAreaMin,
      analysisAreaMax,
      searchString,
      showRSPOCertified,
      selectedSupplier,
      selectedSecondSupplier,
      selectedParentCompany,
      selectedOverallThreats,
      selectedOverallValues,
      selectedMillPriority,
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
      { field: 'selectedSupplier', type: sql.NVarChar, value: selectedSupplier || null },
      {
        field: 'selectedSecondSupplier',
        type: sql.NVarChar,
        value: selectedSecondSupplier || null,
      },
      { field: 'selectedParentCompany', type: sql.NVarChar, value: selectedParentCompany || null },
      { field: 'showRSPOCertified', type: sql.Bit, value: showRSPOCertified || 0 },
      {
        field: 'selectedOverallThreats',
        type: sql.NVarChar,
        value: selectedOverallThreats || null,
      },
      { field: 'selectedOverallValues', type: sql.NVarChar, value: selectedOverallValues || null },
      { field: 'selectedMillPriority', type: sql.NVarChar, value: selectedMillPriority || null },
    ];

    const query = SQLUtils.isSystemDatabase(databaseName)
      ? getAnalysisDataCountForGFWList
      : getAnalysisDataCountForUserList;

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const recordsets = await connection.queryArray<AnalysisDataCountType>(query, parameters);
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
