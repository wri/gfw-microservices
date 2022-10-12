import { take } from 'ts-object-to-model';
import * as sql from 'mssql';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { UserRoute }  from './model';
import { executeStoredProcedure } from '../util/sql';

export const getUserRoute = ( targetEmail: string): Promise<UserRoute> => {

    return new Promise((resolve, reject) => {
        const parameters = [
            { field: 'userEmail', type: sql.NChar, value: targetEmail}
        ];

        executeStoredProcedure(process.env.MSSQL_DATABASE, 'uspGetVerifiedUserRouteInfo', parameters)
        .then((result) => {
            const [mappedValues] =  result.data.map((o:any) => take(o).mapToType(UserRoute, false)); 
            resolve(mappedValues);
        })
        .catch((errorMessage) => {
            logger.error(`getUserRoute: ${errorMessage}`);
            reject(new ErrorException( ErrorCode.InternalServerError, { message: `Get user router failed: ${targetEmail}`}));
        });
    });
}