import * as sql from 'mssql';
import { take } from 'ts-object-to-model';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { FileGenerationFilter, ListNameSchema }  from './model';
import { executeStoredProcedure } from '../util';


/** @function { uspGetListNameSchema }
 *   @summary get the name of the list schema
 *   @param  {String} databaseName - Manadatory first parameter to pass the database which I have to run the query against
 *   @param  {filters} FileGenerationFilter - filters to run the stored procedure
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const uspGetListNameSchema = (databaseName: string, filters: FileGenerationFilter): Promise<ListNameSchema> => {
    const {
        listID
    } =  filters;

    return new Promise((resolve, reject) => {
        const parameters = [
            { field: 'list_id', type: sql.Int, value: listID}
        ];

        executeStoredProcedure(databaseName, 'uspGetListNameSchema', parameters)
        .then((recordsets) => {
            const [mappedValues] = recordsets.data.map((o:any) => take(o).mapToType(ListNameSchema, false));
            resolve(mappedValues);
        })
        .catch((errorMessage) => {
            logger.error(`uspGetListNameSchema: ${errorMessage}`);
            reject(new ErrorException( ErrorCode.InternalServerError, { message: `Failed to get the name of the list ${FileGenerationFilter}`}));
        });
    });
}