import * as sql from 'mssql';

import { logger } from '@wri-monorepos/util'

import { SQLParam, StoredProcedureOutput } from './model';


/**
 * @function executeStoredProcedure
 * @summary Executes a stored procedure for the particular user's database and returns
 *			any records received.
 * @param {String} database - database to run the stored procedure
 * @param {String} storedProcedureName - name of the stored procedure to execute.
 * @param {Array} params - An array of parameters to pass to the stored procedure (OPTIONAL)
 * @return {Array} An array of record sets.
*/
export const executeStoredProcedure = (database: string, storedProcedureName: string, paramsInput: Array<SQLParam>, paramsOutput: Array<SQLParam> = []): Promise<StoredProcedureOutput> => {
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
        if (paramsInput && Array.isArray(paramsInput)) {
            paramsInput.forEach((param) => {
               request.input(param.field, param.type, param.value);
            });
        }

        if (paramsOutput && Array.isArray(paramsOutput)) {
            paramsOutput.forEach((param) => {
               request.output(param.field, param.type, param.value);
            });
        }

        // Execute Stored Procedure.
        request
            .execute(storedProcedureName)
            .then((result) => {
                resolve({
                    data: result.recordset,
                    output: result.output
                });
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
