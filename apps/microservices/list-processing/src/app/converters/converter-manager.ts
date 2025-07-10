import { FindOptionsWhere } from 'typeorm';
import {
  Lists,
  deleteListsWithInvalidLocationId,
  deleteListsWithInvalidCommodityOrTemplate,
  upgradeListSchema,
} from '@wri-monorepos/sql';

export type ConverterFunction = {
  where?: FindOptionsWhere<Lists>;
  run: (params: Record<string, any>) => Promise<unknown>;
};

const registry: Record<string, ConverterFunction> = {
  LIST_SCHEMA: {
    run: upgradeListSchema,
  },
  DELETE_INVALID_LOCATION_LISTS: {
    run: deleteListsWithInvalidLocationId,
  },
  DELETE_INVALID_COMMODITY_TEMPLATE: {
    run: deleteListsWithInvalidCommodityOrTemplate,
  },
  // GADM_VERSION: { run: () => {} },
};

export class ConverterManager {
  static get(name: string): ConverterFunction {
    const converter = registry[name];
    if (!converter) {
      throw new Error(`No converter registered for: ${name}`);
    }
    return converter;
  }
}
