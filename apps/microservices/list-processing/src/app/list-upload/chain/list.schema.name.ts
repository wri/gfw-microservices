import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';
import { getListByFilters } from '@wri-monorepos/sql';

const createListNameSchema = (list_name) => ({
  list_table: `list-${list_name.replace(/\s/g, '').toLowerCase()}`,
  analysis_table: `analysis-${list_name.replace(/\s/g, '').toLowerCase()}`,
});

export class ListSchemaName extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ListSchemaName.name);

  async handle(input: ChainType): Promise<ChainType> {
    const { list_name: listName, organization_database: clientDatabase } = input.request;
    const list = createListNameSchema(listName);
    const listTable = list.list_table;
    const analysisTable = list.analysis_table;

    const doesListNameAlreadyExist = await getListByFilters({ listName: listName }, clientDatabase);

    if (doesListNameAlreadyExist) {
      throw Error(`List name ${listName} already exists.`);
    }

    this.logger.log(`List name schema created: ${listTable}`);

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
