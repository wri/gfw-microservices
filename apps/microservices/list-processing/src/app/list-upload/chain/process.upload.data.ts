import { AbstractHandler, ChainType, AttributeType } from './types';
import { ListSchema, ListSchemaType } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import { EntitySchema } from 'typeorm';
import { Feature } from '@wri-monorepos/geo';
import { GeoJSONGeometry, stringify } from 'wellknown';
import { ConvertPoint2Polygon } from './convert.point.2.polygon';

export class ProcessUploadData extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ProcessUploadData.name);
  private convertPoint2Polygon: ConvertPoint2Polygon;

  constructor() {
    super();
    this.convertPoint2Polygon = new ConvertPoint2Polygon();
  }

  private columnsToExclude: string[] = [
    'locationName',
    'longitude',
    'latitude',
    'commodity',
    'attributes',
    'errorDetails',
  ];

  private inferType(value: unknown): string {
    if (value === null) {
      return 'string';
    }
    if (Array.isArray(value)) {
      return 'string';
    }
    if (typeof value === 'object') {
      return 'string';
    }
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return 'number';
      } else {
        return 'string';
      }
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

  processFeatureAttributes(featurePayload: Feature): Feature {
    const { requiredFields, schemaFields } = this.getFieldsRules();

    const properties = featurePayload.properties;
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

    properties.attributes = JSON.stringify(attributesArray);

    const feature = Object.assign({}, featurePayload, {
      properties,
      geometry: stringify(featurePayload.geometry as GeoJSONGeometry),
    });

    return feature;
  }

  /**
   * @summary it should process parsed data into attributes
   * @param request ChainType
   * @returns request ChainType
   */
  async handle(request: ChainType): Promise<ChainType> {
    const { features: prevFeatures = [] } = request.geojson;
    this.logger.log(`Processing features: ${prevFeatures.length}`);

    const locations = [];
    request.geojson.features = await Promise.all(
      prevFeatures.map(async (feature, index) => {
        try {
          feature = await this.convertPoint2Polygon.convertFeature(feature);
          feature = this.processFeatureAttributes(feature);
          feature.properties.locationId = index + 1;
          locations.push(feature.properties);
        } catch (error) {
          this.logger.error(`Error processing feature`, error.stack || error);
          this.logger.debug(feature);
        }
        return feature;
      })
    );

    return {
      ...request,
      locations,
    };
  }
}
