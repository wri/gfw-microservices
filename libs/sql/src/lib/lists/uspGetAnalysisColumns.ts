import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { ListColumnsByIDRequest } from './model';
import { getAnalysisColumns, getAnalysisGFWColumns } from '../queries';

@Injectable()
export class UspGetAnalysisColumns {
  async run(
    databaseName: string,
    { listId }: ListColumnsByIDRequest,
    isGFWList = false
  ): Promise<unknown[]> {
    const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];
    try {
      const db = isGFWList ? process.env.MSSQL_DATABASE : databaseName;
      const query = isGFWList ? getAnalysisGFWColumns : getAnalysisColumns;

      const recordsets = await SQLUtils.queryDB(db, query, parameters);
      return recordsets as unknown[];
    } catch (error) {
      throw new Error(error);
    }
  }
}
