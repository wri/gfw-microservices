import * as sql from 'mssql';
import { take } from 'ts-object-to-model';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { GetConnectionRequest, PendingConnection }  from './model';
import { executeStoredProcedure } from '../util';

export const uspGetPendingConnection = (filters: GetConnectionRequest): Promise<PendingConnection> => {
    const {
        targetOrganizationId,
        sourceOrganizationId,
        id,
        status,
    } =  filters;

    return new Promise((resolve, reject) => {
        const parameters = [
            { field: 'source_organization', type: sql.Int, value: sourceOrganizationId},
            { field: 'target_organization', type: sql.Int, value: targetOrganizationId},
            { field: 'id', type: sql.Int, value: id},
            { field: 'status', type: sql.NChar, value: status}
        ];

        executeStoredProcedure(process.env.MSSQL_DATABASE, 'uspGetPendingConnection', parameters)
        .then((recordsets) => {
            const mappedValues = recordsets.data.map((o:any) => take(o).mapToType(PendingConnection, false));
            resolve(mappedValues);
        })
        .catch((errorMessage) => {
            logger.error(`uspGetPendingConnection: ${errorMessage}`);
            reject(new ErrorException( ErrorCode.InternalServerError, { message: `Failed get pending connection of the list ${filters}`}));
        });
    });
}