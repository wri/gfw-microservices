import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { ListColumnsByIDRequest } from './model';

@Injectable()
export class UspGetListAnalysis {
  async run(databaseName: string, { listId: listID }: ListColumnsByIDRequest): Promise<unknown[]> {
    const parameters = [{ field: 'list_id', type: sql.Int, value: listID }];

    return await SQLUtils.queryDB<Promise<unknown[]>>(
      databaseName,
      'uspGetListAnalysis',
      parameters
    );
  }
}
