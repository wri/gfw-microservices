import * as sql from 'mssql';

import { logger } from '@wri-monorepos/util'

import { Param } from './model';

/**
 * @function executeOrganizationStoredProcedure
 * @summary Executes a stored procedure for the particular user's database and returns
 *			any records received.
 * @param {String} database - database to run the stored procedure
 * @param {String} storedProcedureName - name of the stored procedure to execute.
 * @param {Array} params - An array of parameters to pass to the stored procedure (OPTIONAL)
 * @return {Array} An array of record sets.
*/
export const executeOrganizationStoredProcedure = (database: string, storedProcedureName: string, params: Array<Param>) => {
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