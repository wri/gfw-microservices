import { FindOptionsWhere } from 'typeorm';

import { CONVERTER_NAMES } from '@wri-monorepos/constants';
import { deleteListsWithInvalidLocationId, upgradeListSchema, Lists } from '@wri-monorepos/sql';

export type ConverterFunction = {
  where?: FindOptionsWhere<Lists>;
  run: (params: Record<string, any>) => Promise<unknown>;
};

const registry: Record<string, ConverterFunction> = {
  [CONVERTER_NAMES.LIST_SCHEMA]: {
    run: upgradeListSchema,
  },
  [CONVERTER_NAMES.DELETE_INVALID_LOCATION_LISTS]: {
    run: deleteListsWithInvalidLocationId,
  },
  // [CONVERTER_NAMES.GADM_VERSION]: { run: () => {} },
  // [CONVERTER_NAMES.EXAMPLE_CONVERTER]: { run: () => {} },
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
