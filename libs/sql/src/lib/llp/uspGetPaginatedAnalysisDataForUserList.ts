import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { GenerationFileRequest } from './model';
import { SQL_CONFIG } from '../config/config';
import {
  AnalysisDataType,
  getPaginatedAnalysisDataForUserList,
} from '../queries/organization/getPaginatedAnalysisDataForUserList';
import { getPaginatedAnalysisDataForGFWList } from '../queries';

@Injectable()
export class UspGetPaginatedAnalysisDataForUserList {
  async run(databaseName: string, filters: GenerationFileRequest) {
    const {
      analysisAreaMax,
      analysisAreaMin,
      combinedColumns,
      country,
      geometry,
      listID,
      locationIds,
      locationLogic,
      locationStatement,
      orderType,
      page,
      rowsPerPage,
      searchString,
      selectedMillPriority,
      selectedOverallThreats,
      selectedOverallValues,
      selectedParentCompany,
      selectedSecondSupplier,
      selectedSupplier,
      showRSPOCertified,
      sortByAttribute,
      state,
      subState,
    } = filters;

    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'PageNumber', type: sql.Int, value: page || 0 },
      { field: 'RowsOfPage', type: sql.Int, value: rowsPerPage || 0 },
      {
        field: 'OrderByColumn',
        type: sql.NVarChar(255),
        value: sortByAttribute || 'Location Name',
      },
      { field: 'Order', type: sql.NVarChar, value: orderType || 'ASC' },
      { field: 'SubState', type: sql.NVarChar, value: subState || null },
      { field: 'Country', type: sql.NVarChar, value: country || null },
      { field: 'State', type: sql.NVarChar, value: state || null },
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
        field: 'LocationLogic',
        type: sql.NVarChar,
        value: locationLogic || null,
      },
      { field: 'LocationIds', type: sql.NVarChar, value: locationIds || null },
      {
        field: 'LocationStatement',
        type: sql.NVarChar,
        value: locationStatement || null,
      },
      {
        field: 'ColumnsToReturn',
        type: sql.NVarChar,
        value: combinedColumns || null,
      },
      {
        field: 'SearchString',
        type: sql.NVarChar,
        value: searchString || null,
      },
      { field: 'Geometry', type: sql.Bit, value: geometry || 0 },
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

    const query =
      databaseName == SQL_CONFIG.database
        ? getPaginatedAnalysisDataForGFWList
        : getPaginatedAnalysisDataForUserList;
    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createListResult = await connection.queryArray<AnalysisDataType>(query, parameters);
      await connection.disconnect();
      return createListResult;
    } catch (error) {
      await connection.disconnect();
      throw new Error(error);
    }
  }
}
