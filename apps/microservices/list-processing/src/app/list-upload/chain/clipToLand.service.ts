import { Logger } from '@nestjs/common';
import axios from 'axios';
// We're using wkx because wellknown only handles wkt instead of wkb
import wkx from 'wkx';

import { AbstractHandler, ChainType, PreviewListRequest, RequestNewList } from './types';
import { Position } from 'typeorm/driver/types/GeoJsonTypes';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { retryWithBackoff, isRetryableError } from '@wri-monorepos/shared/utils/retry';
import { yieldIfLong } from './shared';

export class ClipToLandService extends AbstractHandler<ChainType> {
  logger = new Logger(ClipToLandService.name);

  // Batching value above 100 results in roughly same performance as 100, but may cause timeouts
  // Value of 50 is 20% slower than 100, but may be more reliable
  private BATCH_SIZE = 50;

  private async retryDataAPI(
    retriesLeft: number,
    requestData: Record<string, unknown>,
    feature: Feature
  ): Promise<{ properties: any; geometry: any; type: string }> {
    return retryWithBackoff(
      async () => {
        const response = await axios.post(
          'https://data-api.globalforestwatch.org/dataset/gadm_administrative_boundaries/v4.1.85/query/json',
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.GFW_DATA_API_KEY,
            },
            timeout: 30000, // 30 second timeout
          }
        );

        if (response.status !== 200) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        // Check if response looks like HTML (common error response format)
        if (
          typeof response.data === 'string' &&
          (response.data.trim().startsWith('<html') || response.data.trim().startsWith('<!DOCTYPE'))
        ) {
          throw new Error(
            `Received HTML response instead of JSON (HTTP ${response.status}): ${response.data}`
          );
        }

        // Check if the response has the expected structure
        if (!response.data.data || !response.data.data[0] || !response.data.data[0].st_union) {
          throw new Error(
            `Unexpected response structure (HTTP ${response.status}): ${JSON.stringify(
              response.data
            )}`
          );
        }
        const buffer = Buffer.from(response.data?.data[0].st_union, 'hex');
        const geometry = wkx.Geometry.parse(buffer);
        const geometryToGeoJSON = geometry.toGeoJSON();
        const payload = {
          properties: feature.properties,
          geometry: geometryToGeoJSON,
          type: 'FeatureCollection',
        };
        return payload;
      },
      {
        retries: 3,
        delayMs: 1000,
        isRetryable: isRetryableError,
        logger: this.logger,
      }
    );
  }

  getClipToLandData = async (
    feature: Feature
  ): Promise<{ properties: any; geometry: any; type: string }> => {
    // Type assertion for geometry with coordinates property
    const geometryWithCoords = feature.geometry as Feature['geometry'] & {
      coordinates: Position[];
    };

    const requestData = {
      geometry: feature.geometry,
      sql: `SELECT ST_UNION(ST_Intersection(geom, ST_setSRID(ST_GeomFromGeoJSON('{"type": "${
        feature.geometry.type
      }", "coordinates": ${JSON.stringify(
        geometryWithCoords.coordinates
      )}}') , 4326 ) ) ) FROM mytable WHERE adm_level='1'`,
    };

    try {
      return await this.retryDataAPI(3, requestData, feature);
    } catch (error) {
      const statusCode = error.response?.status || error.code;

      this.logger.warn(`ERROR in request (${statusCode}):`, error.stack || error.message);
      this.logger.warn(
        `Returning feature without geometry for feature ${
          feature.properties?.locationName || 'unknown'
        }`
      );
      const payload = {
        properties: {
          ...feature.properties,
          errorDetails: `ERROR in request (${statusCode}): ${error.message}`,
        },
        geometry: {},
        type: 'Feature',
      };
      // Add a small delay before rethrowing
      if (error.response?.status !== 429) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return payload;
    }
  };

  private async processBatch(batch: Feature[], request: ChainType): Promise<Feature[]> {
    this.cleanBatchGeometry(batch);
    try {
      const result = await Promise.all(batch.map((feature) => this.getClipToLandData(feature)));
      return result as Feature[];
    } catch (e) {
      (request.request as RequestNewList).hasUnanalyzableError = true;
      batch.forEach((feature) => {
        feature.properties.errorDetails = feature.properties.errorDetails || [];
        (feature.properties.errorDetails as Array<string>).push(
          `Potential clipToLand error: ${e.message || e}`
        );
      });
      this.logger.warn('Error in processBatch:', e.stack || e);
      return batch; // Return original features if processing fails
    }
  }

  private cleanBatchGeometry(batch: Feature[]): void {
    batch.forEach((feature) => {
      if (feature.properties && feature.properties.geometry) {
        delete feature.properties.geometry;
      }
    });
  }

  private async logProgressAndYield(
    i: number,
    total: number,
    lastYieldTimestamp: number
  ): Promise<number> {
    if (Math.random() < 0.1) {
      this.logger.debug(`clipToLand - progress: ${i} of ${total}`);
    }
    return yieldIfLong(lastYieldTimestamp);
  }

  clipToLand = async (
    geojson: FeatureCollection,
    request: ChainType
  ): Promise<{ geojson: FeatureCollection }> => {
    const { features } = geojson;
    const processedFeatures: Feature[] = [];
    let lastYieldTimestamp = Date.now();

    for (let i = 0; i < features.length; i += this.BATCH_SIZE) {
      const batch = features.slice(i, i + this.BATCH_SIZE);
      try {
        const processedBatch = await this.processBatch(batch, request);
        processedFeatures.push(...processedBatch);
      } catch (e) {
        this.logger.warn('Error processing batch:', e);
        processedFeatures.push(...batch);
      }
      lastYieldTimestamp = await this.logProgressAndYield(i, features.length, lastYieldTimestamp);
    }

    return {
      geojson: {
        type: 'FeatureCollection',
        features: processedFeatures,
      },
    };
  };

  async handle(request: ChainType): Promise<ChainType> {
    const { geojson } = request;

    const { path, preview = false } = request.request as PreviewListRequest;

    if ((request.request as RequestNewList).hasUnanalyzableError) {
      // Skip GADM if there is already an error in the request
      return request;
    }

    // We should not call clip to land if we are in the preview mode.
    if (!preview) {
      const response = await this.clipToLand(geojson, request);
      request.geojson = response.geojson;
    }
    this.logger.debug('ClipToLandService - done with ', path);
    return request;
  }
}
