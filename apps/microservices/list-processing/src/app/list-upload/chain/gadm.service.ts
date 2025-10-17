import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest, RequestNewList } from './types';
import asyncPool from 'tiny-async-pool';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 6,
  retryDelay: (retryCount) => {
    const baseDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 30000);
    const jitter = Math.random() * 1000; // Add up to 1 second of random
    return baseDelay + jitter;
  },
  retryCondition: (error) => {
    // Retry on network errors, timeouts, and specific HTTP status codes
    const isNetworkError = !error.response && !!error.code;
    const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    const isRetryableStatus =
      error.response?.status && [429, 500, 502, 503, 504].includes(error.response.status);

    return Boolean(
      axiosRetry.isRetryableError(error) || isNetworkError || isTimeout || isRetryableStatus
    );
  },
});
const POOL_SIZE = 50;
export class GADMService extends AbstractHandler<ChainType> {
  logger = new Logger(GADMService.name);

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
    try {
      const response = await axios.post(
        'https://data-api.globalforestwatch.org/dataset/gadm_administrative_boundaries/v4.1.64/query/json',
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
    } catch (error) {
      this.logger.error(
        `Error fetching GADM data for feature at ${latitude}, ${longitude}`,
        error.response?.data?.message || error.stack
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.logger.error(`Error fetching GADM data`, error.response?.data || error.stack);
      return { hasUnanalyzableError: true };
    }
  };

  addGeoReferenceData = async (feature: Feature, features: Feature[]) => {
    try {
      const response = await this.getGadmData(feature);

      if (response.length) {
        // some locations (e.g. Libya) don't have gid_2, so use gid_1 instead
        const fullGid = response[0].gid_2 || response[0].gid_1 || '';
        feature.properties = {
          ...feature.properties,
          subState: response[0].name_2 || '',
          state: response[0].name_1,
          country: response[0].name_0,
          gadmid: fullGid.split('_')[0],
        };
        if (Math.random() < 0.001) {
          // Log progress for approximately 0.1% of features
          const done = features.filter((f) => f.properties.country).length;
          this.logger.debug(`GADMService - progress: ${done} of ${features.length}`);
        }
      }
    } catch (e) {
      this.logger.error('Error in queryGADM', e.stack || e.message);
      return {
        hasUnanalyzableError: true,
      };
    }
  };

  async asyncPoolAll(...args) {
    const results = [];
    for await (const undefRet of asyncPool(...args)) {
      results.push(undefRet);
    }
    return results;
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { geojson } = request;

    const { path } = request.request as PreviewListRequest;
    const { features } = geojson as FeatureCollection;

    if ((request.request as RequestNewList).hasUnanalyzableError) {
      // Skip GADM if there is already an error in the request
      return request;
    }

    const method = this.addGeoReferenceData;

    const results = await this.asyncPoolAll(POOL_SIZE, features, method);

    if (results.some((result) => result?.hasUnanalyzableError)) {
      (request.request as RequestNewList).hasUnanalyzableError = true;
    }

    this.logger.debug('GADMService - done with getGeoReferenceData for', path);
    return request;
  }
}
