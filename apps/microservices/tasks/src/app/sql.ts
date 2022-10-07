import * as sql from 'mssql';

import { logger } from './logger';
import { createErrorMessage, Param, Filters } from './util'; 
import { errorCodes } from './constants'; 


interface Pages {
    numberOfPages: number;
}

interface ListNameSchema{
    id: string;
    user_id: string;
    list_name: string;
    list_table_name: string;
    list_analysis_table_name: string;
}

/**
 * @function executeOrganizationStoredProcedure
 * @summary Executes a stored procedure for the particular user's database and returns
 *			any records received.
 * @param {String} database - database to run the stored procedure
 * @param {String} storedProcedureName - name of the stored procedure to execute.
 * @param {Array} params - An array of parameters to pass to the stored procedure (OPTIONAL)
 * @return {Array} An array of record sets.
*/
const executeOrganizationStoredProcedure = (database: string, storedProcedureName: string, params: Array<Param>) => {
return new Promise((resolve, reject) => {
    // Create SQL Connection Config based on session database.
    const SQLConfig = {
    server: process.env.MSSQL_HOSTNAME,
    database,
    user: process.env.MSSQL_USERNAME,
    port: parseInt(process.env.MSSQL_PORT, 10),
    password: process.env.MSSQL_PASSWORD,
    requestTimeout: 30000,
    options: {
        encrypt: false,
    },
    };

    const pool = new sql.ConnectionPool(SQLConfig, (err) => {
    if (err) {
        throw err;
    }
    // Get Request Object. Query
    const request = new sql.Request(pool);
    // Add parameters to the request object.
    if (params && Array.isArray(params)) {
        params.forEach((param) => {
        request.input(param.field, param.type, param.value);
        });
    }
    // Execute Stored Procedure.
    request
        .execute(storedProcedureName)
        .then((result) => {
        resolve(result.recordsets[0]);
        pool.close();
        })
        .catch((errorMessage) => {
        logger.error('Executing stored procedure ', storedProcedureName);
        logger.error(errorMessage);
        reject(errorMessage);
        });
    });
});
};

/** @function {getPaginatedAnalysisDataForUserList}
 *   @summary Get function to return json of paginated location metadata with geometry.
 *   @param  {String} databaseName - Manadatory first parameter to pass the database which I have to run the query against
 *   @param  {Integer} list_id - Unique list id of the list.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getPaginatedAnalysisDataForUserList = (databaseName: string, filters: Filters) :  Promise<Array<any>> => {
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
  
      executeOrganizationStoredProcedure(databaseName, 'uspGetPaginatedAnalysisDataForUserList', parameters)
        .then((recordsets: Array<any>) => {
          resolve(recordsets);
        })
        .catch((errorMessage) => {
          const errorObject = createErrorMessage(
            errorCodes.failedToGetList,
            `Failed to get paginated list location for List ${listID}`,
            errorMessage
          );
          reject(errorObject);
        });
    });
  };
/** @function {getNumberPagesForAnalysisDataUserList}
 *   @summary Get function to return the number of pages for the paginated analysis data for a user list.
 *   @param  {String} databaseName - Manadatory first parameter to pass the database which I have to run the query against
 *   @param  {Integer} list_id - Unique list id of the list.
 *   @param  {Integer} filters- filters
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getNumberPagesForAnalysisDataUserList = (databaseName: string, filters: Filters): Promise<Pages> => {

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

        executeOrganizationStoredProcedure(databaseName, 'uspGetAnalysisDataCountForUserList', parameters)
        .then((recordsets) => {
            const numberOfPages = Math.ceil(recordsets[0].TotalRows / rowsPerPage);
            resolve({ numberOfPages });
        })
        .catch((errorMessage) => {
            const errorObject = createErrorMessage(
            errorCodes.failedToGetList,
            `Failed to get number of pages for List ${listID}`,
            errorMessage
            );
            reject(errorObject);
        });
    });
};


export const getListNameSchema = (databaseName: string, filters: Filters): Promise<ListNameSchema> => {
    const {
        listID
    } =  filters;

    return new Promise((resolve, reject) => {
        const parameters = [
            { field: 'list_id', type: sql.Int, value: listID}
        ];

        executeOrganizationStoredProcedure(databaseName, 'uspGetListNameSchema', parameters)
        .then((recordsets) => {
            resolve(recordsets[0]);
        })
        .catch((errorMessage) => {
            const errorObject = createErrorMessage(
            errorCodes.failedToGetList,
            `Failed to get the name of the list ${listID}`,
            errorMessage
            );
            reject(errorObject);
        });
    });
}