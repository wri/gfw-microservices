import * as sql from 'mssql';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { PendingConnection }  from './model';
import { executeStoredProcedure } from '../util';

export const insertPendingConnection = (filters: PendingConnection): Promise<any> => {

    const {
        sourceEmail,
        targetEmail,
        sourceOrganization,
        targetOrganization,
        token,
        id,
    } =  filters;

    return new Promise((resolve, reject) => {
        const parametersInput = [
            { field: 'source_email', type: sql.NChar, value: sourceEmail},
            { field: 'target_email', type: sql.NChar, value: targetEmail},
            { field: 'source_organization', type: sql.Int, value: sourceOrganization},
            { field: 'target_organization', type: sql.Int, value: targetOrganization},
            { field: 'token', type: sql.NChar, value: token},
        ];

        const parametersOutput = [
            { field: 'id_pending_connection', type: sql.Int, value: id},
        ];

        executeStoredProcedure(process.env.MSSQL_DATABASE, 'uspCreatePendingConnection', parametersInput, parametersOutput)
        .then((recordsets) => {
            resolve(recordsets.output);
        })
        .catch((errorMessage) => {
            logger.error(`insertPendingConnection: ${errorMessage}`);
            reject(new ErrorException( ErrorCode.InternalServerError, { message: `Failed to create pending connection ${targetEmail}`}));
        });
    });
}

