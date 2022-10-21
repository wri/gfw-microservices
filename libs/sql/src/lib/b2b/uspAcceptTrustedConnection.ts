import * as sql from 'mssql';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { ChangeStatusPendingConnectionRequest }  from './model';
import { executeStoredProcedure } from '../util';

export const uspAcceptTrustedConnection = (filters: ChangeStatusPendingConnectionRequest): Promise<any> => {

    const {
      idPendingConnection,
      userEmail,
      organizationId
    } =  filters;

    return new Promise((resolve, reject) => {
        const parametersInput = [
            { field: 'user_email', type: sql.NChar, value: userEmail},
            { field: 'target_organization', type: sql.Int, value: organizationId},
            { field: 'id_pending_connection', type: sql.Int, value: idPendingConnection},
        ];

        executeStoredProcedure(process.env.MSSQL_DATABASE, 'uspAcceptTrustedConnection', parametersInput, null)
        .then((recordsets) => {
            resolve(recordsets.output);
        })
        .catch((errorMessage) => {
            logger.error(`uspAcceptTrustedConnection: ${errorMessage}`);
            reject(new ErrorException( ErrorCode.InternalServerError, { message: `Failed to accept the pending connection ${userEmail}`}));
        });
    });
}

