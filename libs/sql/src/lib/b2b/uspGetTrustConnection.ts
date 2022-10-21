import * as sql from 'mssql';
import { take } from 'ts-object-to-model';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { GetConnectionRequest, TrustedConnection }  from './model';
import { executeStoredProcedure } from '../util';

export const uspGetTrustConnection = (filters: GetConnectionRequest): Promise<TrustedConnection> => {
    const {
        sourceOrganizationId,
        targetOrganizationId,
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

        executeStoredProcedure(process.env.MSSQL_DATABASE, 'uspGetTrustConnection', parameters)
        .then((recordsets) => {
            const mappedValues = recordsets.data.map((o:any) => take(o).mapToType(TrustedConnection, false));
            resolve(mappedValues);
        })
        .catch((errorMessage) => {
            logger.error(`uspGetTrustConnection: ${errorMessage}`);
            reject(new ErrorException( ErrorCode.InternalServerError, { message: `Failed get trusted connection of the list ${filters}`}));
        });
    });
}
