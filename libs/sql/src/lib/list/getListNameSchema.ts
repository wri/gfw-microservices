import * as sql from 'mssql';
import { take } from 'ts-object-to-model';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { FileGenerationFilter, ListNameSchema }  from './model';
import { executeStoredProcedure } from '../util';

export const getListNameSchema = (databaseName: string, filters: FileGenerationFilter): Promise<ListNameSchema> => {
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
            logger.error(`getListNameSchema: ${errorMessage}`);
            reject(new ErrorException( ErrorCode.InternalServerError, { message: `Failed to get the name of the list ${FileGenerationFilter}`}));
        });
    });
}