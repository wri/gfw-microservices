import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { GenerationFileRequest } from './model';
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
      listId,
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
      { field: 'listID', type: sql.Int, value: listId },
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
      { field: 'SearchString', type: sql.Float, value: searchString || null },
      { field: 'selectedSupplier', type: sql.NVarChar(255), value: selectedSupplier || null },
      {
        field: 'selectedSecondSupplier',
        type: sql.NVarChar(255),
        value: selectedSecondSupplier || null,
      },
      {
        field: 'selectedParentCompany',
        type: sql.NVarChar(255),
        value: selectedParentCompany || null,
      },
      { field: 'showRSPOCertified', type: sql.Bit, value: showRSPOCertified || 0 },
      {
        field: 'selectedOverallThreats',
        type: sql.NVarChar(255),
        value: selectedOverallThreats || null,
      },
      {
        field: 'selectedOverallValues',
        type: sql.NVarChar(255),
        value: selectedOverallValues || null,
      },
      {
        field: 'selectedMillPriority',
        type: sql.NVarChar(255),
        value: selectedMillPriority || null,
      },
    ];

    const query = SQLUtils.isSystemDatabase(databaseName)
      ? getAnalysisDataCountForGFWList
      : getAnalysisDataCountForUserList;

    const recordsets = await SQLUtils.queryDB<AnalysisDataCountType[]>(
      databaseName,
      query,
      parameters
    );

    const totalRows = recordsets.find((record) => record.statistic_type === 'Row Count').statistic;
    const maximumAnalysisAreaInTheList = recordsets.find(
      (record) => record.statistic_type === 'Max Area'
    ).statistic;
    let numberOfPages = 2;
    if (totalRows) {
      numberOfPages = rowsPerPage ? Math.ceil(totalRows / rowsPerPage) : 1;
    }
    return {
      numberOfPages,
      numberOfResults: totalRows,
      maximumAnalysisAreaInTheList,
    };
  }
}
