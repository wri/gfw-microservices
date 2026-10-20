/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';

export class GetObjectTypes extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(GetObjectTypes.name);
  getObjectTypes(obj, excludeFields = []) {
    const types = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && !excludeFields.includes(key)) {
        types[key] = typeof obj[key];
      }
    }
    return types;
  }

  mergeTypes(existingTypes, newTypes) {
    for (const key in newTypes) {
      if (!existingTypes[key]) {
        existingTypes[key] = newTypes[key];
      } else if (existingTypes[key] && !existingTypes[key].includes(newTypes[key])) {
        existingTypes[key] = `${existingTypes[key]}, ${newTypes[key]}`;
      }
    }
    return existingTypes;
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { geojson } = request;

    let mergedTypes = {};
    const excludeFields = ['name'];
    geojson.features.forEach((feature) => {
      const propertyTypes = this.getObjectTypes(feature.properties, excludeFields);
      mergedTypes = this.mergeTypes(mergedTypes, propertyTypes);
    });

    this.logger.log(mergedTypes);
    return request;
  }
}
