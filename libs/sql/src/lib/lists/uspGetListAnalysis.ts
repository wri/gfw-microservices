import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

import { ListColumnsByIDRequest } from './model';
import { ListFieldsFileRequest } from '../llp/model';

type ListLevelAnalysisType = ListFieldsFileRequest['listLevelAnalysis'];

@Injectable()
export class UspGetListAnalysis {
  async run(
    databaseName: string,
    { listId: listID }: ListColumnsByIDRequest
  ): Promise<ListLevelAnalysisType[]> {
    const parameters = [{ field: 'list_id', type: sql.Int, value: listID }];

    return await SQLUtils.queryDB<Promise<ListLevelAnalysisType[]>>(
      databaseName,
      'uspGetListAnalysis',
      parameters
    );
  }
}
