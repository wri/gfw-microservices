import { AbstractHandler, ChainType } from './types';

export class GetObjectTypes extends AbstractHandler<ChainType> {
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
      }
    }
    return existingTypes;
  }

  async handle(input: ChainType): Promise<ChainType> {
    const { geojson } = input;

    let mergedTypes = {};
    const excludeFields = ['name'];
    geojson.features.forEach((feature) => {
      const propertyTypes = this.getObjectTypes(feature.properties, excludeFields);
      mergedTypes = this.mergeTypes(mergedTypes, propertyTypes);
    });

    console.log(mergedTypes);

    return super.handle(input);
  }
}
