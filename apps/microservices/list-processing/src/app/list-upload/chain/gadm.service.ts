import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest, RequestNewList } from './types';
import asyncPool from 'tiny-async-pool';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import Bottleneck from 'bottleneck';

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // axios-retry normally does not retry POSTs, so using a custom condition
    return axiosRetry.isRetryableError(error) || error.response?.status === 429;
  },
});

const POOL_SIZE = 20; // Increased pool size since we have higher rate limit
const DEFAULT_DELAY = 200;
const MAX_LIMIT = process.env.NODE_ENV.toLocaleLowerCase() === 'development' ? 5 : 100; // Maximum requests per second

export class GADMService extends AbstractHandler<ChainType> {
  logger = new Logger(GADMService.name);

  // Using Bottleneck for rate limiting
  private limiter = new Bottleneck({
    maxConcurrent: POOL_SIZE,
    minTime: Math.floor(1000 / MAX_LIMIT), // Requests per second
    reservoir: MAX_LIMIT, // Max requests per second
    reservoirRefreshAmount: MAX_LIMIT,
    reservoirRefreshInterval: 1000, // Refresh reservoir every second
  });

  /**
   * Function to perform a GET request using axios with Bottleneck rate limiting.
   * @param {Feature} feature - The feature object containing properties and geometry.
   * @returns {Promise<IFeatureSet>} - A promise that resolves to the query result.
   */
  getGadmData = async (feature: Feature, retryCount = 0) => {
    const { latitude, longitude, hasUnanalyzableError } = feature.properties;
    if (hasUnanalyzableError) {
      throw new Error('Feature does not have valid longitude/latitude or geometry.');
    }

    const geometry = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    const sql = "SELECT gid_1, gid_2, name_0, name_1, name_2 FROM mytable WHERE adm_level='2'";

    // Using Bottleneck to limit the rate of requests
    return this.limiter.schedule(async () => {
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
        // Handle 429 (Too Many Requests) with specific retry logic
        if (error.response?.status === 429 && retryCount < 3) {
          this.logger.warn(
            `Rate limited (429) for GADM request at ${latitude}, ${longitude}. Retrying (attempt ${
              retryCount + 1
            }/3)`
          );

          await new Promise((resolve) => setTimeout(resolve, DEFAULT_DELAY));
          return this.getGadmData(feature, retryCount + 1);
        }

        this.logger.error(
          `Error fetching GADM data for feature at ${latitude}, ${longitude}`,
          error.response?.data?.message || error.stack
        );

        return { hasUnanalyzableError: true };
      }
    });
  };

  addGeoReferenceData = async (feature: Feature) => {
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
      }
    } catch (e) {
      this.logger.error('Error in queryGADM', e.stack || e.message);
      return {
        hasUnanalyzableError: true,
      };
    }
  };

  composeResultsWithGadmData = async (feature: Feature) => {
    await this.addGeoReferenceData(feature);
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

    const method = this.composeResultsWithGadmData;

    const results = await this.asyncPoolAll(POOL_SIZE, features, method);

    if (results.some((result) => result?.hasUnanalyzableError)) {
      (request.request as RequestNewList).hasUnanalyzableError = true;
    }

    this.logger.debug('GADMService - done with getGeoReferenceData for', path);
    return request;
  }
}
