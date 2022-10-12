/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sql from 'mssql';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { FileGenerationFilter } from './model';
import { executeStoredProcedure } from '../util';

/** @function {getPaginatedAnalysisDataForUserList}
 *   @summary Get function to return json of paginated location metadata with geometry.
 *   @param  {String} databaseName - Manadatory first parameter to pass the database which I have to run the query against
 *   @param  {Integer} list_id - Unique list id of the list.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
 export const getPaginatedAnalysisDataForUserList = (databaseName: string, filters: FileGenerationFilter) => {
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
  
    return new Promise((resolve, reject) => {
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
  
      executeStoredProcedure(databaseName, 'uspGetPaginatedAnalysisDataForUserList', parameters)
        .then((recordsets) => {
          
          resolve(recordsets.data);
        })
        .catch((errorMessage) => {
          logger.error(`getPaginatedAnalysisDataForUserList: ${errorMessage}`);
          reject(new ErrorException( ErrorCode.InternalServerError, { message: `Failed to get paginated list location for List ${listID}`}));
        });
    });
  };