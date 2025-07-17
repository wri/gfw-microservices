import { AbstractHandler, ChainType, AttributeType, RequestNewList } from './types';
import {
  ClientStoreConnection,
  Lists,
  getListsLocsColumnsToExclude,
  getFormattedAttributes,
  saveListAttributes,
  ListAttributesRecord,
  ListsAttrsTypes,
  getListAttributes,
} from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import { Feature } from '@wri-monorepos/geo';
import { GeoJSONGeometry, stringify } from 'wellknown';
import { ConvertPoint2Polygon } from './convert.point.2.polygon';
import { getMaxLocationId } from '../shared/list.utils';

export class ProcessUploadData extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ProcessUploadData.name);
  private convertPoint2Polygon: ConvertPoint2Polygon;
  private columnsToExclude: string[];
  private listsAttributesRecords: Map<string, ListAttributesRecord>;

  constructor() {
    super();
    this.convertPoint2Polygon = new ConvertPoint2Polygon();
    this.columnsToExclude = getListsLocsColumnsToExclude();
    this.listsAttributesRecords = new Map();
  }

  getValidAttributes(properties: string[]): string[] {
    return properties.filter((col) => !['', ...this.columnsToExclude].includes(col));
  }

  processFeatureAttributes(featurePayload: Feature, listId: number) {
    // commenting this out for now because it is too verbose
    // this.logger.log(`Processing list-xxx.attributes. Excluding Columns: ${this.columnsToExclude}`);

    let validAttrs = this.getValidAttributes(Object.keys(featurePayload.properties || {}));
    const attributesJson: AttributeType = {};

    // if there are no extra columns, perhaps this is a move operation
    if (
      validAttrs.length < 1 &&
      typeof featurePayload.properties.attributes === 'string' &&
      featurePayload.properties.attributes
    ) {
      const parsedAttributes = JSON.parse(featurePayload.properties.attributes || '{}');

      featurePayload.properties = {
        ...featurePayload.properties,
        ...parsedAttributes,
      };

      validAttrs = Object.keys(parsedAttributes);
    }

    for (const attributeField of validAttrs) {
      const rawValue = featurePayload.properties[attributeField];

      if (rawValue !== null) {
        attributesJson[attributeField] = String(rawValue);
      }

      const newRecord = getFormattedAttributes({
        listId,
        attributeField,
        fieldValue: rawValue ?? '',
      });

      const existingRecord = this.listsAttributesRecords.get(attributeField);

      if (!existingRecord) {
        this.listsAttributesRecords.set(attributeField, newRecord);
      } else if (
        // we upgrade number in older locations to text if later locations have text
        existingRecord.attribute_type === ListsAttrsTypes.Number &&
        newRecord.attribute_type === ListsAttrsTypes.Text
      ) {
        this.listsAttributesRecords.set(attributeField, newRecord);
      }
    }

    return JSON.stringify(attributesJson);
  }

  getFeatureGeometry(featurePayload: Feature): string {
    return stringify(featurePayload.geometry as GeoJSONGeometry);
  }

  async processFeature(
    feature: Feature,
    locationId: number,
    commodity: string,
    request: ChainType
  ): Promise<Feature> {
    if (!feature.properties) {
      return feature;
    }

    const { list_id: listId } = request.request as RequestNewList;
    feature = await this.convertPoint2Polygon.convertFeature(feature, request);
    const { properties } = feature;

    properties.attributes = this.processFeatureAttributes(feature, listId);
    properties.locationId = locationId;
    properties.commodity = commodity;

    const geometry = this.getFeatureGeometry(feature);

    return Object.assign({}, feature, {
      properties: {
        ...properties,
        geometry,
      },
      geometry,
    });
  }

  async getListCommodity(organizationDatabase: string, listId: number): Promise<string> {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(Lists);
    const { Commodity } = await listRepository.findOne({
      where: { id: listId },
    });
    return Commodity;
  }

  async getProcessedFeatures(features: Feature[], commodity, request): Promise<Feature[]> {
    const { list_id: listId, organization_database: organizationDatabase } =
      request.request as RequestNewList;

    const clientStoreConnection = new ClientStoreConnection();
    const listLocationsCount =
      (await getMaxLocationId(clientStoreConnection, organizationDatabase, listId)) ?? 0;

    return await Promise.all(
      features.map(async (feature, index) => {
        try {
          const processedFeature = await this.processFeature(
            feature,
            listLocationsCount + index + 1,
            commodity,
            request
          );

          // Calculate area for polygon features
          return processedFeature;
        } catch (error) {
          this.logger.error(`Error processing feature`, error.stack || error);
          this.logger.debug(feature);
          throw error;
        }
      })
    );
  }

  getFeatPropAttrs(request: ChainType) {
    if (!request.geojson.features[0]) {
      return [];
    }
    const { list_id } = request.request as RequestNewList;
    const validAttrs = this.getValidAttributes(
      Object.keys(request.geojson.features[0]?.properties ?? {})
    );

    return validAttrs.map((attributeField) =>
      getFormattedAttributes({
        listId: list_id,
        attributeField,
        fieldValue: request.geojson.features[0]?.properties[attributeField] ?? '',
      })
    );
  }

  async getExistingListAttributes(organization_database: string, list_id: number) {
    const listAttributes = await getListAttributes(organization_database, list_id);

    listAttributes.map((attribute) => {
      this.listsAttributesRecords.set(attribute.attribute_name, attribute);
    });
  }

  /**
   * @summary it should process parsed data into attributes
   * @param input ChainType
   * @returns request ChainType
   */
  async handle(input: ChainType): Promise<ChainType> {
    const { list_id, organization_database } = input.request as RequestNewList;
    const { features: prevFeatures = [] } = input.geojson;
    this.logger.log(`Processing features: ${prevFeatures.length}`);

    await this.getExistingListAttributes(organization_database, list_id);

    const commodity = await this.getListCommodity(organization_database, list_id);
    input.geojson.features = await this.getProcessedFeatures(prevFeatures, commodity, input);

    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(organization_database);
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (this.listsAttributesRecords.size > 0) {
        await saveListAttributes(queryRunner, [...this.listsAttributesRecords.values()]);
        input = {
          ...input,
          request: {
            listAttributesRecords: this.listsAttributesRecords,
            ...input.request,
          },
        };
      }
      await queryRunner.commitTransaction();
      return input;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
