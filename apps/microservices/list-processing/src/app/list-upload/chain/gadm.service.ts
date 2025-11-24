import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest, RequestNewList } from './types';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { HttpStatus } from '@nestjs/common';
import { yieldIfLong } from './shared';

const DEFAULT_DELAY = 1000;
const retryableHttpStatusCodes = [
  HttpStatus.TOO_MANY_REQUESTS,
  HttpStatus.INTERNAL_SERVER_ERROR,
  HttpStatus.BAD_GATEWAY,
  HttpStatus.SERVICE_UNAVAILABLE,
  HttpStatus.GATEWAY_TIMEOUT,
];

const isRetryableError = (error) => {
  // Retry on network errors, timeouts, and specific HTTP status codes
  const isNetworkError = !error.response && !!error.code;
  const statusCode = error.response?.status || error.code;
  const isTimeout =
    error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET';
  const isRetryableStatus = statusCode && retryableHttpStatusCodes.includes(statusCode);
  return Boolean(
    axiosRetry.isRetryableError(error) || isNetworkError || isTimeout || isRetryableStatus
  );
};


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

    const geometry = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    const sql = "SELECT gid_1, gid_2, name_0, name_1, name_2 FROM mytable WHERE adm_level='2'";

    const response = await axios.post(
      'https://data-api.globalforestwatch.org/dataset/gadm_administrative_boundaries/v4.1.85/query/json',
      { sql, geometry },
      {
        headers: {
          'x-api-key': process.env.GFW_DATA_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.data?.data;
  };

  addGeoReferenceData = async (feature: Feature): Promise<void> => {
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
    } catch (error) {
      const { latitude, longitude } = feature.properties;
      this.logger.error(
        `Error fetching GADM data for feature at ${latitude}, ${longitude}`,
        error.response?.data?.message || error.stack
      );
      feature.properties.hasUnanalyzableError = true;
    }
  };

  async processBatch(batch: Feature[], request: ChainType): Promise<Feature[]> {
    try {
      await Promise.all(batch.map((feature) => this.addGeoReferenceData(feature)));
      return batch;
    } catch (e) {
      (request.request as RequestNewList).hasUnanalyzableError = true;
      this.logger.warn('Error in processBatch:', e.stack || e);
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
