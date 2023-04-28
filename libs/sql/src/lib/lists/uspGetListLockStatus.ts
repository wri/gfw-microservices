import { SQLUtils } from '../util/sql.utils';
import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';

import { SQL_CONFIG } from '../config/config';

export interface UspGetListLockStatusRecorset {
  lock_status?: number;
  lock_user_id?: number;
}

export interface UspGetListLockStatusParams {
  list_id: number;
}

@Injectable()
export class UspGetListLockStatus {
  async run(
    databaseName: string,
    { list_id }: UspGetListLockStatusParams
  ): Promise<UspGetListLockStatusRecorset> {
    const parameters = [{ field: 'list_id', type: sql.Int, value: list_id }];

    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const recordsets = await connection.executeQuery<
        Promise<UspGetListLockStatusRecorset>
      >('uspGetListLockStatus', parameters);
      connection.disconnect();
      return recordsets;
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
