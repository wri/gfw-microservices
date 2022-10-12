import { take } from 'ts-object-to-model';
import * as sql from 'mssql';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { UserInfo }  from './model';
import { executeStoredProcedure } from '../util/sql';


export const getUserInfo = ( database: string,  targetEmail: string ): Promise<UserInfo> => {

    return new Promise((resolve, reject) => {
        const parameters = [
            { field: 'userEmail', type: sql.NChar, value: targetEmail}
        ];

        executeStoredProcedure(database, 'uspGetUserInfoByEmail', parameters)
        .then((result) => {
            const [mappedValues] =  result.data.map((o:any) => take(o).mapToType(UserInfo, false));
            resolve(mappedValues);
        })
        .catch((errorMessage) => {
            logger.error(`getUserInfo: ${errorMessage}`);
            reject(new ErrorException( ErrorCode.InternalServerError, { message: `Get user information faile: ${targetEmail}`}));
        });
    });
}