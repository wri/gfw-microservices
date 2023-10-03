import { Logger, Injectable } from '@nestjs/common';
import { AfiService } from './afi.service';
import { ListService } from './list.service';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { MAX_NUMBER_OF_ROWS_PER_PAGE } from '../shared/constants';
import * as sql from 'mssql';

import { SQLUtils, ListNameSchema } from '@wri-monorepos/sql';

@Injectable()
export class PipeService {
  private readonly logger = new Logger(PipeService.name);

  constructor(private readonly afiService: AfiService, private readonly listService: ListService) {}

  public async makeFile(filters: GenerationFileRequest) {
    const { type, organizationDatabase, listID } = filters;

    this.logger.log(`(${listID}) - Receive request to build file for list`);

    const parameters = [{ field: 'list_id', type: sql.Int, value: listID }];
    const { list_name } = await SQLUtils.queryDB<ListNameSchema>(
      organizationDatabase,
      'uspGetListNameSchema',
      parameters
    );

    filters = {
      ...filters,
      listName: list_name,
      rowsPerPage: MAX_NUMBER_OF_ROWS_PER_PAGE,
    };

    if (type == 'afi') {
      this.afiService.makeFile(filters);
    } else {
      this.listService.makeFile(filters);
    }
  }
}
