/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

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
import { checkListSizeLimit } from '../../common/check.listSizelimit';

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
      // sanitize the attribute field to keep only printable ASCII characters
      // (removes carriage returns, newlines, tabs, and other control characters)
      // so that list details UI does not break due to unexpected characters
      // eslint-disable-next-line no-control-regex
      const sanitizedKey = attributeField.replace(/[^\x20-\x7E]/g, '');

      // Re-check the sanitized key: a key made only of control characters can
      // collapse to an empty string, and a key like "location_id\r" sanitizes
      // into a reserved/excluded column (e.g. "location_id"). Skip these so we
      // do not reintroduce the SQL/UI breakage this sanitization prevents.
      if (!sanitizedKey || this.columnsToExclude.includes(sanitizedKey)) {
        continue;
      }

      if (rawValue !== null) {
        attributesJson[sanitizedKey] = String(rawValue);
      }

      const newRecord = getFormattedAttributes({
        listId,
        attributeField: sanitizedKey,
        fieldValue: rawValue ?? '',
      });

      const existingRecord = this.listsAttributesRecords.get(sanitizedKey);

      if (!existingRecord) {
        this.listsAttributesRecords.set(sanitizedKey, newRecord);
      } else if (
        // we upgrade number in older locations to text if later locations have text
        existingRecord.attribute_type === ListsAttrsTypes.Number &&
        newRecord.attribute_type === ListsAttrsTypes.Text
      ) {
        this.listsAttributesRecords.set(sanitizedKey, newRecord);
      }
    }

    return JSON.stringify(attributesJson);
  }

  getFeatureGeometry(featurePayload: Feature): string {
    try {
      return stringify(featurePayload.geometry as GeoJSONGeometry);
    } catch (error) {
      this.logger.error('Error converting geometry', error);
      return '';
    }
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
    // Enforce per-list size limit prior to assigning new ids
    await checkListSizeLimit(organizationDatabase, listId, features);

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

    if (this.listsAttributesRecords.size > 0) {
      await connection.manager.transaction(async (transactionalEntityManager) => {
        await saveListAttributes(transactionalEntityManager, [
          ...this.listsAttributesRecords.values(),
        ]);
      });
      input = {
        ...input,
        request: {
          listAttributesRecords: this.listsAttributesRecords,
          ...input.request,
        },
      };
    }
    return input;
  }
}
