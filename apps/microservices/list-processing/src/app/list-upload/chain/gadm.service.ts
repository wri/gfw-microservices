import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest, RequestNewList } from './types';
import asyncPool from 'tiny-async-pool';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { IFeatureSet, IGeometry, queryFeatures } from '@esri/arcgis-rest-feature-service';
import { featureFlagsService } from '@wri-monorepos/shared';
import { FeatureFlag } from '@wri-monorepos/sql';
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // axios-retry normally does not retry POSTs, so using a custom condition
    return axiosRetry.isRetryableError(error);
  },
});
const PRODUCTION_ENVIRONMENTS = ['production', 'ProdV2'];
const POOL_SIZE = 20;

const GADM_SERVICE__PROD =
  'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin_2_gridded/MapServer/0'; // Only for production
const GADM_SERVICE__STAGING =
  'https://gfwpro-gis-stg.globalforestwatch.org/arcgis/rest/services/GADM36_admin_2_gridded/MapServer/0';

export class GADMService extends AbstractHandler<ChainType> {
  logger = new Logger(GADMService.name);

  getGadmServiceUrl = () => {
    return PRODUCTION_ENVIRONMENTS.includes(process.env.NODE_ENV)
      ? GADM_SERVICE__PROD
      : GADM_SERVICE__STAGING;
  };

  /**
   * Function to perform a GET request using axios.
   * @param {Feature} feature - The feature object containing properties and geometry.
   * @returns {Promise<IFeatureSet>} - A promise that resolves to the query result.
   */
  async queryGADM(feature: Feature): Promise<IFeatureSet> {
    const { latitude, longitude, hasUnanalyzableError } = feature.properties;

    if (hasUnanalyzableError) {
      throw new Error('Feature does not have valid longitude/latitude or geometry.');
    }

    const response = (await queryFeatures({
      url: this.getGadmServiceUrl(),
      geometry: {
        x: longitude,
        y: latitude,
        spatialReference: {
          wkid: 4326,
        },
      } as IGeometry,
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: ['gadmid', 'name_0', 'name_1', 'name_2'],
    })) as IFeatureSet;

    return response;
  }

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
      this.logger.error(`Error fetching GADM data`, error.response?.data || error.stack);
      return null;
    }
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
  getGeoReferenceData = async (feature: Feature) => {
    try {
      const response = await this.queryGADM(feature);

      if (response.features && response.features.length > 0) {
        feature.properties = {
          ...feature.properties,
          subState: response.features[0].attributes.name_2,
          state: response.features[0].attributes.name_1,
          country: response.features[0].attributes.name_0,
          gadmid: response.features[0].attributes.gadmid,
        };
      }
    } catch (e) {
      this.logger.error('Error in queryGADM', e.stack || e.message);
      return {
        hasUnanalyzableError: true,
      };
    }
  };

  composeResults = async (feature: Feature) => {
    await this.getGeoReferenceData(feature);
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

    const { organization_id } = request.request as RequestNewList;

    const { getFeatureFlagsForCurrentOrg } = await featureFlagsService();
    const flags = await getFeatureFlagsForCurrentOrg(organization_id);

    const gadm41FeatureFlag = flags.find((f) => f.flagId === 'gadm41') as FeatureFlag;

    const { path } = request.request as PreviewListRequest;
    const { features } = geojson as FeatureCollection;

    if ((request.request as RequestNewList).hasUnanalyzableError) {
      // Skip GADM if there is already an error in the request
      return request;
    }

    const method = gadm41FeatureFlag?.flagState
      ? this.composeResultsWithGadmData
      : this.composeResults;

    const results = await this.asyncPoolAll(POOL_SIZE, features, method);

    if (results.some((result) => result?.hasUnanalyzableError)) {
      (request.request as RequestNewList).hasUnanalyzableError = true;
    }

    this.logger.debug('GADMService - done with getGeoReferenceData for', path);
    return request;
  }
}
