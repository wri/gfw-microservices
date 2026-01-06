import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest, RequestNewList } from './types';
import { Feature, FeatureCollection, Polygon } from '@wri-monorepos/geo';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { yieldIfLong, isRetryableError } from './shared';
import wkx from 'wkx';
import { Position } from 'typeorm/driver/types/GeoJsonTypes';

const DEFAULT_DELAY = 1000;

axiosRetry(axios, {
  retries: 6,
  retryDelay: (retryCount) => {
    const baseDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 30000);
    const jitter = Math.random() * DEFAULT_DELAY;
    return baseDelay + jitter;
  },
  retryCondition: isRetryableError,
});

export class GADMService extends AbstractHandler<ChainType> {
  logger = new Logger(GADMService.name);

  private BATCH_SIZE = 50;

  private async retryDataAPI(retriesLeft: number, requestData: any, feature: Feature) {
    try {
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
      const data = response.data?.data;
      if (!data || !Array.isArray(data) || !data.length || !data[0]) {
        throw new Error(
          `Unexpected response structure (HTTP ${response.status}): ${JSON.stringify(
            response.data
          )}`
        );
      }
      return data;
    } catch (error) {
      const statusCode = error.response?.status || error.code;
      // retry only for certain timeout/network errors
      if (retriesLeft > 0 && isRetryableError(error)) {
        this.logger.warn(
          `Retryable error in request (${statusCode}). Retries left: ${retriesLeft}. Retrying...`,
          error.response?.data || error.message
        );
        await new Promise((resolve) => setTimeout(resolve, DEFAULT_DELAY));
        return this.retryDataAPI(retriesLeft - 1, requestData, feature);
      }
      throw error;
    }
  }

  /**
   * Function to perform a GET request using axios.
   * @param {Feature} feature - The feature object containing properties and geometry.
   * @returns {Promise<IFeatureSet>} - A promise that resolves to the query result.
   */
  getGadmData = async (feature: Feature) => {
    const { latitude, longitude, hasUnanalyzableError } = feature.properties;
    if (hasUnanalyzableError) {
      throw new Error('Feature does not have valid longitude/latitude or geometry.');
    }

    const centroidGeometry = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    const geometryWithCoords = feature.geometry as Feature['geometry'] & {
      coordinates: Position[];
    };
    const fullGeometry = {
      type: feature.geometry.type,
      coordinates: geometryWithCoords.coordinates,
    };
    const centroidGeometryJson = JSON.stringify(centroidGeometry).replace(/'/g, "''");
    const fullGeometryJson = JSON.stringify(fullGeometry).replace(/'/g, "''");
    const sql = `SELECT
    MAX(CASE WHEN ST_Contains(geom, ST_GeomFromGeoJSON(' ${centroidGeometryJson} ')) THEN gid_1 END) as gid_1,
    MAX(CASE WHEN ST_Contains(geom, ST_GeomFromGeoJSON(' ${centroidGeometryJson} ')) THEN gid_2 END) as gid_2,
    MAX(CASE WHEN ST_Contains(geom, ST_GeomFromGeoJSON(' ${centroidGeometryJson} ')) THEN name_0 END) as name_0,
    MAX(CASE WHEN ST_Contains(geom, ST_GeomFromGeoJSON(' ${centroidGeometryJson} ')) THEN name_1 END) as name_1,
    MAX(CASE WHEN ST_Contains(geom, ST_GeomFromGeoJSON(' ${centroidGeometryJson} ')) THEN name_2 END) as name_2,
    ST_UNION(ST_Intersection(geom, ST_GeomFromGeoJSON(' ${fullGeometryJson} '))) as st_union
    FROM data WHERE (adm_level='2') OR (adm_level='1')`;
    // putting adm_level 1 to handle locations without adm2 (e.g. Libya)
    // but having adm_level 2 first and in parenthesis to prioritize adm_level 2

    const requestData = {
      geometry: feature.geometry,
      sql: sql,
    };

    return await this.retryDataAPI(3, requestData, feature);
  };

  // remove very tiny polygons that sometimes appear due to GADM level
  private discardTinyPolygons(geometry: Polygon): void {
    const TINY_LAT_LONG_DIFF = 0.0000001; // approx 1 cm
    geometry.coordinates = geometry.coordinates.filter((coords) => {
      // Keep non-array items as-is (shouldn't happen but defensive coding)
      if (!Array.isArray(coords)) {
        this.logger.warn('Unexpected non-array coordinate ring in geometry:', coords);
        return true;
      }
      // Filter out tiny polygons where all points are essentially the same
      return !coords.every(
        ([x, y]) =>
          Math.abs(x - coords[0][0]) < TINY_LAT_LONG_DIFF &&
          Math.abs(y - coords[0][1]) < TINY_LAT_LONG_DIFF
      );
    });
  }

  addGeoReferenceData = async (feature: Feature): Promise<any> => {
    try {
      const response = await this.getGadmData(feature);

      if (Array.isArray(response) && response.length > 0) {
        // some locations (e.g. Libya) don't have gid_2, so use gid_1 instead
        const fullGid = response[0].gid_2 || response[0].gid_1 || '';
        feature.properties = {
          ...feature.properties,
          subState: response[0].name_2 || '',
          state: response[0].name_1,
          country: response[0].name_0,
          gadmid: fullGid.split('_')[0],
        };
      }
      const payload = {
        properties: feature.properties,
        geometry: feature.geometry,
        type: 'FeatureCollection',
      };
      if (response[0]?.st_union) {
        const buffer = Buffer.from(response[0]?.st_union, 'hex');
        const geometry = wkx.Geometry.parse(buffer);
        const geometryToGeoJson = geometry.toGeoJSON() as Polygon;
        this.discardTinyPolygons(geometryToGeoJson);
        payload.geometry = geometryToGeoJson;
      }
      return payload;
    } catch (error) {
      const statusCode = error.response?.status || error.code;
      this.logger.warn(
        `ERROR in gadm request (${statusCode}):`,
        error.stack || error.message,
        JSON.stringify(error.response?.data)
      );
      const { latitude, longitude } = feature.properties;
      this.logger.error(
        `Error fetching GADM data for feature at ${latitude}, ${longitude}`,
        error.response?.data?.message || error.stack
      );
      feature.properties.hasUnanalyzableError = true;

      const payload = {
        properties: {
          ...feature.properties,
          errorDetails: `ERROR in gadm request (${statusCode}): ${error.message}`,
        },
        geometry: {},
        type: 'Feature',
      };
      return payload;
    }
  };

  async processBatch(batch: Feature[], request: ChainType): Promise<Feature[]> {
    batch.forEach((feature) => {
      if (feature.properties && feature.properties.geometry) {
        delete feature.properties.geometry;
      }
    });

    try {
      const result = await Promise.all(batch.map((feature) => this.addGeoReferenceData(feature)));
      return result as Feature[];
    } catch (e) {
      (request.request as RequestNewList).hasUnanalyzableError = true;
      batch.forEach((feature) => {
        feature.properties.errorDetails = feature.properties.errorDetails || [];
        (feature.properties.errorDetails as Array<string>).push(
          `Potential gadm error: ${e.message || e}`
        );
      });
      this.logger.warn('Error in gadm.processBatch:', e.stack || e);
      return batch;
    }
  }

  addGeoReferenceDataToFeatures = async (
    geojson: FeatureCollection,
    request: ChainType
  ): Promise<FeatureCollection> => {
    const { features } = geojson;
    const processedFeatures: Feature[] = [];
    let lastYieldTimestamp = Date.now();

    // Process features in batches
    for (let i = 0; i < features.length; i += this.BATCH_SIZE) {
      const batch = features.slice(i, i + this.BATCH_SIZE);
      try {
        const processedBatch = await this.processBatch(batch, request);
        processedFeatures.push(...processedBatch);
      } catch (e) {
        this.logger.warn('Error processing batch:', e);
        processedFeatures.push(...batch);
      }
      if (Math.random() < 0.1) {
        // Log progress for approximately 10% of batches
        this.logger.debug(`GADMService - progress: ${i} of ${features.length}`);
      }
      // periodically yield to avoid CPU overload that may trigger AWS ECS health check failure
      lastYieldTimestamp = await yieldIfLong(lastYieldTimestamp);
    }

    return {
      type: 'FeatureCollection',
      features: processedFeatures,
    };
  };

  async handle(request: ChainType): Promise<ChainType> {
    const { geojson } = request;
    const { path } = request.request as PreviewListRequest;

    if ((request.request as RequestNewList).hasUnanalyzableError) {
      // Skip GADM if there is already an error in the request
      return request;
    }

    const processedGeoJson = await this.addGeoReferenceDataToFeatures(
      geojson as FeatureCollection,
      request
    );
    request.geojson = processedGeoJson;

    if (processedGeoJson.features.some((feature) => feature.properties?.hasUnanalyzableError)) {
      (request.request as RequestNewList).hasUnanalyzableError = true;
    }

    this.logger.debug('GADMService - done with getGeoReferenceData for', path);
    return request;
  }
}
