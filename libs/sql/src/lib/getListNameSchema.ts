import { createErrorMessage, errorCodes } from '@wri-monorepos/util'

import * as sql from 'mssql';

import { Filters, ListNameSchema }  from './model';
import { executeOrganizationStoredProcedure } from './sql';

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