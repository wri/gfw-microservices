import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { getListByFilters } from '@wri-monorepos/sql';
import { performance } from 'perf_hooks';
import { getDurationAsString } from './shared';

const createListNameSchema = (list_name) => ({
  list_table: `list-${list_name.replace(/\s/g, '').toLowerCase()}`,
  analysis_table: `analysis-${list_name.replace(/\s/g, '').toLowerCase()}`,
});

export class ListSchemaName extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ListSchemaName.name);

  async handle(input: ChainType): Promise<ChainType> {
    const start = performance.now();
    const { list_name: listName, organization_database: clientDatabase } =
      input.request as RequestNewList;
    const list = createListNameSchema(listName);
    const listTable = list.list_table;
    const analysisTable = list.analysis_table;

    const doesListNameAlreadyExist = await getListByFilters({ listName: listName }, clientDatabase);

    if (doesListNameAlreadyExist) {
      throw Error(`List name ${listName} already exists.`);
    }

    this.logger.log(`List name schema created: ${listTable}`);

    const end = performance.now();
    this.logger.debug(`Execution time: ${getDurationAsString(start, end)}`);

    return super.handle({
      ...input,
      request: {
        ...input.request,
        listTable,
        analysisTable,
        listStatusId: 1,
        locationClassification: 'Property',
        customAttributeNames: '',
        customAttributeTypes: '',
      },
    });
  }
}
