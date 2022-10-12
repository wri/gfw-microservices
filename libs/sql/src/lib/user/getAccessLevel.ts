
import { take } from 'ts-object-to-model';

import { ErrorException, ErrorCode, logger } from '@wri-monorepos/util';

import { AccessLevel }  from './model';

import { executeStoredProcedure } from '../util';

export const getAccessLevel = (): Promise<Array<AccessLevel>> => {

    return new Promise((resolve, reject) => {
        executeStoredProcedure(process.env.MSSQL_DATABASE, 'uspGetAccessLevels', null)
        .then((result) => {
            const accessLevels =  result.data.map((o:any) => take(o).mapToType(AccessLevel, false)); 
            resolve(accessLevels);
        })
        .catch((errorMessage) => {
            logger.error(`getAccessLevel: ${errorMessage}`);
            reject(new ErrorException( ErrorCode.InternalServerError, { message: `Problem to retrieve all access level`}));
        });
    });
}