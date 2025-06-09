import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { getListByFilters } from '@wri-monorepos/sql';

const normalizeListName = (list_name: string): string => {
  // Convert accented characters to their non-accented equivalents
  const normalized = list_name.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  // Remove periods and spaces and convert to lowercase
  return normalized.replace(/[.\s]/g, '').toLowerCase();
};

const createListNameSchema = (list_name: string) => {
  const normalizedName = normalizeListName(list_name);
  return {
    list_table: `list-${normalizedName}`,
    analysis_table: `analysis-${normalizedName}`,
  };
};

export class ListSchemaName extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ListSchemaName.name);
  private validateList: boolean;

  constructor(validateList = true) {
    super();
    this.validateList = validateList;
  }

  async handle(request: ChainType): Promise<ChainType> {
    const {
      list_name: listName,
      organization_database: clientDatabase,
      commodity,
    } = request.request as RequestNewList;
    const list = createListNameSchema(listName);
    const listTable = list.list_table;
    const analysisTable = list.analysis_table;

    if (this.validateList) {
      const doesListNameAlreadyExist = await getListByFilters(
        { listName: listName },
        clientDatabase
      );
      if (doesListNameAlreadyExist) {
        throw Error(`List name ${listName} already exists.`);
      }
    }

    this.logger.log(`List name schema created: ${listTable}`);

    return {
      ...request,
      request: {
        ...request.request,
        listTable,
        analysisTable,
        locationClassification: 'Property',
        customAttributeNames: '',
        customAttributeTypes: '',
        commodity,
      },
    };
  }
}
