import * as sql from 'mssql';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { ChangeStatusPendingConnectionRequest }  from './model';
import { executeStoredProcedure } from '../util';

export const uspUpdatePendingConnectionStatus = (filters: ChangeStatusPendingConnectionRequest): Promise<any> => {

    const {
      idPendingConnection,
      userEmail,
    } =  filters;

    return new Promise((resolve, reject) => {
        const parametersInput = [
            { field: 'ids', type: sql.NChar, value: `${idPendingConnection}`},
        ];

        executeStoredProcedure(process.env.MSSQL_DATABASE, 'uspUpdatePendingConnectionStatus', parametersInput, null)
        .then((recordsets) => {
            resolve(recordsets.output);
        })
        .catch((errorMessage) => {
            logger.error(`uspUpdatePendingConnectionStatus: ${errorMessage}`);
            reject(new ErrorException( ErrorCode.InternalServerError, { message: `Failed to change status from pending connection ${userEmail}`}));
        });
    });
}
