import * as sql from 'mssql';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { FileGenerationFilter, Pages }  from './model';
import { executeStoredProcedure } from '../util';

/** @function {getNumberPagesForAnalysisDataUserList}
 *   @summary Get function to return the number of pages for the paginated analysis data for a user list.
 *   @param  {String} databaseName - Manadatory first parameter to pass the database which I have to run the query against
 *   @param  {Integer} list_id - Unique list id of the list.
 *   @param  {Integer} filters- filters
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
 export const getNumberPagesForAnalysisDataUserList = (databaseName: string, filters: FileGenerationFilter): Promise<Pages> => {

    const {
        country,
        listID,
        state,
        subState,
        rowsPerPage,
    } =  filters;

    return new Promise((resolve, reject) => {
        const parameters = [
            { field: 'listID', type: sql.Int, value: listID},
            { field: 'Country', type: sql.NVarChar, value: country || null },
            { field: 'State', type: sql.NVarChar, value: state || null },
            { field: 'SubState', type: sql.NVarChar, value: subState || null },
        ];

        executeStoredProcedure(databaseName, 'uspGetAnalysisDataCountForUserList', parameters)
        .then((recordsets) => {
            const [value] = recordsets.data;
            const numberOfPages = Math.ceil(value.TotalRows / (rowsPerPage || 100));
            resolve({ numberOfPages });
        })
        .catch((errorMessage) => {
            logger.error(`getNumberPagesForAnalysisDataUserList: ${errorMessage}`);
            reject(new ErrorException( ErrorCode.InternalServerError, { message: `Failed to get number of pages for List ${listID}`}));
        });
    });
};