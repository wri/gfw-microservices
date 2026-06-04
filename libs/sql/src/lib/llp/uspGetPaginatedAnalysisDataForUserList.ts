import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { ListFieldsFileRequest } from './model';
import {
  AnalysisDataType,
  getPaginatedAnalysisDataForUserList,
  getPaginatedAnalysisDataForGFWList,
} from '../queries';
import { getListJsonAttributesColumnsSqlParam } from '../list-attributes';

@Injectable()
export class UspGetPaginatedAnalysisDataForUserList {
  async run(databaseName: string, filters: ListFieldsFileRequest) {
    const {
      analysisAreaMin,
      combinedColumns,
      country,
      geometry,
      listId,
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
      { field: 'listID', type: sql.Int, value: listId },
      { field: 'PageNumber', type: sql.Int, value: page || 0 },
      { field: 'RowsOfPage', type: sql.Int, value: rowsPerPage || 0 },
      {
        field: 'OrderByColumn',
        type: sql.NVarChar(255),
        value: sortByAttribute || 'Location Name',
      },
      { field: 'Order', type: sql.NVarChar(255), value: orderType || 'ASC' },
      { field: 'SubState', type: sql.NVarChar(255), value: subState || null },
      { field: 'Country', type: sql.NVarChar(255), value: country || null },
      { field: 'State', type: sql.NVarChar(255), value: state || null },
      {
        field: 'AnalysisAreaMin',
        type: sql.Int,
        value: analysisAreaMin || null,
      },
      // Calculated Sourcing Area filter removed (GPV-1274); proc param retained as no-op until DB cleanup.
      {
        field: 'AnalysisAreaMax',
        type: sql.Int,
        value: null,
      },
      {
        field: 'LocationLogic',
        type: sql.NVarChar(255),
        value: locationLogic || null,
      },
      { field: 'LocationIds', type: sql.NVarChar(255), value: locationIds || null },
      {
        field: 'LocationStatement',
        type: sql.NVarChar(255),
        value: locationStatement || null,
      },
      {
        field: 'ColumnsToReturn',
        type: sql.NVarChar(255),
        value: combinedColumns || null,
      },
      {
        field: 'SearchString',
        type: sql.NVarChar(255),
        value: searchString || null,
      },
      { field: 'Geometry', type: sql.Bit, value: geometry || 0 },
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

    const jsonAttributesParam = {
      field: 'jsonAttributeColumns',
      type: sql.NVarChar(sql.MAX),
      value: null,
    };

    if (!SQLUtils.isSystemDatabase(databaseName)) {
      const jsonAttributesColumns = await getListJsonAttributesColumnsSqlParam(
        databaseName,
        listId
      );
      jsonAttributesParam.value = jsonAttributesColumns;
    }

    parameters.push(jsonAttributesParam);

    const query = SQLUtils.isSystemDatabase(databaseName)
      ? getPaginatedAnalysisDataForGFWList
      : getPaginatedAnalysisDataForUserList;

    return await SQLUtils.queryDB<AnalysisDataType[]>(databaseName, query, parameters);
  }
}
