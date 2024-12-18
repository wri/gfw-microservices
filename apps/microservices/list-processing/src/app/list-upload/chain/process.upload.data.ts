import { AbstractHandler, ChainType, AttributeType } from './types';
import { ListSchema, ListSchemaType } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import { EntitySchema } from 'typeorm';
import { Feature } from '@wri-monorepos/geo';
import { GeoJSONGeometry, stringify } from 'wellknown';

export class ProcessUploadData extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ProcessUploadData.name);

  private columnsToExclude: string[] = [
    'locationName',
    'longitude',
    'latitude',
    'commodity',
    'attributes',
    'errorDetails',
  ];

  private inferType(value: unknown): string {
    if (value === null) return 'string';
    if (Array.isArray(value)) return 'string';
    if (typeof value === 'object') return 'string';
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return 'number';
      else return 'string';
    }
    return typeof value;
  }

  private getFieldsRules() {
    const { options } = new EntitySchema<ListSchemaType>({
      ...ListSchema,
    });
    const { columns } = options;
    const requiredFields = Object.keys(columns).filter((field) => {
      const fieldDef = columns[field];
      return fieldDef?.nullable !== true;
    });

    const schemaFields = Object.keys(columns);

    return { requiredFields, schemaFields } as const;
  }

  async processForFeature(featurePayload: Feature): Promise<Feature> {
    const { requiredFields, schemaFields } = this.getFieldsRules();
    const feature = Object.assign({}, featurePayload, {
      geometry: stringify(featurePayload.geometry as GeoJSONGeometry),
    });

    const properties = feature.properties;
    const propertiesKeys = Object.keys(properties);
    const attributesArray = [];

    propertiesKeys.forEach((propertyName) => {
      if (this.columnsToExclude.includes(propertyName) || requiredFields.includes(propertyName)) {
        return;
      }

      const isCustom = !schemaFields.includes(propertyName);
      const propertyValue = properties[propertyName];
      const inferredType = this.inferType(propertyValue);

      const attributeObject: AttributeType = {
        field: propertyName,
        value: propertyValue,
        type: inferredType,
      };

      if (isCustom) {
        attributeObject.custom = isCustom;
      }

      attributesArray.push(attributeObject);
    });

    // update reference
    properties['attributes'] = JSON.stringify(attributesArray);
    feature.properties = properties;

    return feature;
  }

  /**
   * @summary it should process parsed data into attributes
   * @param request ChainType
   * @returns request ChainType
   */
  async handle(request: ChainType): Promise<ChainType> {
    const features = request.geojson.features;
    const { requiredFields, schemaFields } = this.getFieldsRules();

    this.logger.log(`Processing uploaded properties into attributes column`);
    for (const feature of features) {
      const properties = feature.properties;
      const attributesArray = [];

      for (const propertyName in properties) {
        if (this.columnsToExclude.includes(propertyName) || requiredFields.includes(propertyName))
          continue;

        const isCustom = !schemaFields.includes(propertyName);
        const propertyValue = properties[propertyName];
        const inferredType = this.inferType(propertyValue);

        const attributeObject: AttributeType = {
          field: propertyName,
          value: propertyValue,
          type: inferredType,
        };

        if (isCustom) {
          attributeObject.custom = isCustom;
        }

        attributesArray.push(attributeObject);
      }
      // update reference
      properties['attributes'] = JSON.stringify(attributesArray);
    }

    return request;
  }
}
