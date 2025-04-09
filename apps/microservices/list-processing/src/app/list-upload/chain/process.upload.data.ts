import { AbstractHandler, ChainType, AttributeType, RequestNewList } from './types';
import {
  ClientStoreConnection,
  Lists,
  getListsLocsColumnsToExclude,
  getFormattedAttributes,
  saveListAttributes,
  ListAttributesRecord,
} from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import { Feature } from '@wri-monorepos/geo';
import { GeoJSONGeometry, stringify } from 'wellknown';
import { ConvertPoint2Polygon } from './convert.point.2.polygon';

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

  processFeatureAttributes(featurePayload: Feature, list_id: number) {
    this.logger.log(`Processing list-xxx.attributes. Excluding Columns: ${this.columnsToExclude}`);

    const validAttrs = this.getValidAttributes(Object.keys(featurePayload.properties || {}));
    const attributesJson: AttributeType = {};

    for (const attributeField of validAttrs) {
      const rawValue = featurePayload.properties[attributeField];

      if (rawValue !== null) {
        attributesJson[attributeField] = String(rawValue);
      }

      if (!this.listsAttributesRecords.has(attributeField)) {
        this.listsAttributesRecords.set(
          attributeField,
          getFormattedAttributes({
            listId: list_id,
            attributeField,
            fieldValue: rawValue ?? '',
          })
        );
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

    const { list_id } = request.request as RequestNewList;
    feature = await this.convertPoint2Polygon.convertFeature(feature, request);
    const { properties } = feature;

    properties.attributes = this.processFeatureAttributes(feature, list_id);
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
    return await Promise.all(
      features.map(async (feature, index) => {
        try {
          return await this.processFeature(feature, index + 1, commodity, request);
        } catch (error) {
          this.logger.error(`Error processing feature`, error.stack || error);
          this.logger.debug(feature);
          throw error;
        }
      })
    );
  }

  /**
   * @summary it should process parsed data into attributes
   * @param request ChainType
   * @returns request ChainType
   */
  async handle(request: ChainType): Promise<ChainType> {
    const { list_id, organization_database } = request.request as RequestNewList;
    const { features: prevFeatures = [] } = request.geojson;
    this.logger.log(`Processing features: ${prevFeatures.length}`);

    const commodity = await this.getListCommodity(organization_database, list_id);
    request.geojson.features = await this.getProcessedFeatures(prevFeatures, commodity, request);

    if (this.listsAttributesRecords.size > 0) {
      await saveListAttributes(organization_database, [...this.listsAttributesRecords.values()]);
    }

    return request;
  }
}
