import { FindOptionsWhere } from 'typeorm';
import { Lists, upgradeListSchema } from '@wri-monorepos/sql';

import {
  addPrimaryKeyOnLocationId,
  deleteListsWithInvalidLocationId,
  deleteListsPartlyUpgraded,
  deleteListsWithMissingTables,
} from './functions';

export type ConverterFunction = {
  where?: FindOptionsWhere<Lists>;
  run: (params: Record<string, any>) => Promise<unknown>;
};

const registry: Record<string, ConverterFunction> = {
  ADD_LOCATION_ID_PRIMARY_KEY: {
    run: addPrimaryKeyOnLocationId,
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
  UPGRADE_LIST_SCHEMA: {
    where: { version: 0 },
    run: upgradeListSchema,
  },
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
