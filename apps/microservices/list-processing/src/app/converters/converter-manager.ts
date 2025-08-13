import { FindOptionsWhere } from 'typeorm';
import {
  Lists,
  deleteListsWithInvalidLocationId,
  deleteListsPartlyUpgraded,
  deleteListsWithMissingTables,
  upgradeListSchema,
} from '@wri-monorepos/sql';

export type ConverterFunction = {
  where?: FindOptionsWhere<Lists>;
  run: (params: Record<string, any>) => Promise<unknown>;
};

const registry: Record<string, ConverterFunction> = {
  UPGRADE_LIST_SCHEMA: {
    where: { version: 0 },
    run: upgradeListSchema,
  },
  DELETE_INVALID_LOCATION_LISTS: {
    run: deleteListsWithInvalidLocationId,
  },
  DELETE_PARTLY_UPDATED_LISTS: {
    run: deleteListsPartlyUpgraded,
  },
  DELETE_MISSING_TABLE_LISTS: {
    run: deleteListsWithMissingTables,
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
