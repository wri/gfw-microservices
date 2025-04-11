import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest, RequestNewList } from './types';
import asyncPool from 'tiny-async-pool';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { IFeatureSet, IGeometry, queryFeatures } from '@esri/arcgis-rest-feature-service';
import { LambdaClient, InvokeCommand, InvocationType } from '@aws-sdk/client-lambda';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { S3Service } from '@wri-monorepos/aws';
import { featureFlagsService } from '@wri-monorepos/shared';
import { FeatureFlag } from '@wri-monorepos/sql';
import * as turf from '@turf/turf';

const PRODUCTION_ENVIRONMENTS = ['production', 'ProdV2'];
const POOL_SIZE = 5;

const GADM_SERVICE__PROD =
  'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin_2_gridded/MapServer/0'; // Only for production
const GADM_SERVICE__STAGING =
  'https://gfwpro-gis-stg.globalforestwatch.org/arcgis/rest/services/GADM36_admin_2_gridded/MapServer/0';

export class GADMService extends AbstractHandler<ChainType> {
  logger = new Logger(GADMService.name);

  LAMBDA_HTTP_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  putObject = async (objectName, object) => {
    const s3Service = new S3Service();

    const filePath = `${process.env.NODE_ENV}/${objectName}.geojson`;

    await s3Service.putObject(
      filePath,
      JSON.stringify(object),
      process.env.AWS_ANALYSIS_BUCKET,
      'application/json'
    );
    return filePath;
  };

  getObject = async (bucket, key) => {
    const s3Service = new S3Service();
    return await s3Service.getObjectAsJson(bucket, key);
  };

  delObject = async (bucket, key) => {
    const s3Service = new S3Service();

    await s3Service.deleteObject(key, bucket);
  };

  invokeLambda = async (FunctionName: string, payload: object = {}) => {
    const client = new LambdaClient({
      apiVersion: '2015-03-31',
      region: 'us-east-1',
      requestHandler: new NodeHttpHandler({
        requestTimeout: this.LAMBDA_HTTP_TIMEOUT_MS,
      }),
    });

    const functionName = `${FunctionName}-${process.env.NODE_ENV}`;
    const payloadString = JSON.stringify(payload);
    const parameters = {
      FunctionName: functionName,
      Payload: Buffer.from(payloadString), // Ensure payload is a Buffer
      InvocationType: InvocationType.RequestResponse, // Explicitly use the enum
    };
    Logger.log('FunctionName', functionName);

    const command = new InvokeCommand(parameters);
    const { Payload: LambdaPayload } = await client.send(command);
    const result = Buffer.from(LambdaPayload).toString();
    return { Payload: result };
  };

  getGadmServiceUrl = () => {
    return PRODUCTION_ENVIRONMENTS.includes(process.env.NODE_ENV)
      ? GADM_SERVICE__PROD
      : GADM_SERVICE__STAGING;
  };

  getLatLngFromFeature = (feature: Feature) => {
    if (
      feature.properties.longitude !== undefined &&
      feature.properties.latitude !== undefined &&
      feature.properties.longitude !== null &&
      feature.properties.latitude !== null
    ) {
      return {
        longitude: feature.properties.longitude as number,
        latitude: feature.properties.latitude as number,
      };
    }

    try {
      const centroid = turf.centroid(feature.geometry as unknown as turf.AllGeoJSON);
      return {
        longitude: centroid.geometry.coordinates[0],
        latitude: centroid.geometry.coordinates[1],
      };
    } catch (e) {
      this.logger.error('Error in getting centroid from polygon', e);
    }

    if (
      feature.geometry &&
      feature.geometry.type === 'Polygon' &&
      feature.geometry.coordinates.length > 0
    ) {
      // Assuming the coordinates are in the format [ [ [x1, y1], [x2, y2], ... ] ]
      const firstPoint = Array.isArray(feature.geometry.coordinates[0][0])
        ? feature.geometry.coordinates[0][0]
        : feature.geometry.coordinates[0];
      return {
        longitude: firstPoint[0] as number,
        latitude: firstPoint[1] as number,
      };
    }
    if (
      feature.geometry &&
      feature.geometry.type === 'Point' &&
      feature.geometry.coordinates.length > 0
    ) {
      // Assuming the coordinates are in the format [ [ [x1, y1], [x2, y2], ... ] ]
      const firstPoint = feature.geometry.coordinates;
      return {
        longitude: firstPoint[0],
        latitude: firstPoint[1],
      };
    }

    return {
      latitude: 0,
      longitude: 0,
      hasUnanalyzableError: true,
    };
  };

  /**
   * Function to perform a GET request using axios.
   * @param {Feature} feature - The feature object containing properties and geometry.
   * @returns {Promise<IFeatureSet>} - A promise that resolves to the query result.
   */
  async queryGADM(feature: Feature): Promise<IFeatureSet> {
    const { latitude, longitude, hasUnanalyzableError } = this.getLatLngFromFeature(feature);

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
    const { latitude, longitude, hasUnanalyzableError } = this.getLatLngFromFeature(feature);
    if (hasUnanalyzableError) {
      throw new Error('Feature does not have valid longitude/latitude or geometry.');
    }

    const geometry = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    const sql = "SELECT gid_2, name_0, name_1, name_2 FROM mytable WHERE adm_level='2'";
    try {
      const response = await fetch(
        'https://data-api.globalforestwatch.org/dataset/gadm_administrative_boundaries/v4.1.64/query/json',
        {
          method: 'POST',
          headers: {
            'x-api-key': process.env.GFW_DATA_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql, geometry }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const { data } = await response.json();

      return data;
    } catch (error) {
      this.logger.error(`Error fetching GADM data`, error.response?.data || error.stack);
      return null;
    }
  };

  addGeoReferenceData = async (feature: Feature) => {
    try {
      const response = await this.getGadmData(feature);

      if (response.length) {
        feature.properties = {
          ...feature.properties,
          subState: response[0].name_2,
          state: response[0].name_1,
          country: response[0].name_0,
          gadmid: response[0].gid_2.split('_')[0],
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

  clipToLand = async (geojson, request): Promise<{ geojson: FeatureCollection }> => {
    const s3ObjectsToDelete = [];
    const objectName = `gadm-${new Date().getTime()}`;

    try {
      const location_info = await this.putObject(objectName, { geojson: geojson });
      const s3Info = {
        bucket: process.env.AWS_ANALYSIS_BUCKET,
        key: location_info,
      };
      s3ObjectsToDelete.push(s3Info);

      const lambdaResult = await this.invokeLambda('controller-admin-areas', {
        receipt_handle: 'NOTARECEIPT',
        s3_location_info: s3Info,
        layer: 'gadm',
        dissolve_aoi: false,
        post_process_aoi: false,
      });

      const { Payload } = lambdaResult;
      const { bucket, key, errorMessageStr } = JSON.parse(Payload);
      let errorMessage = errorMessageStr || '';

      try {
        errorMessage = JSON.parse(errorMessageStr);
      } catch (e) {
        void e; // ignore any JSON parsing errors
      }

      if (errorMessage.length || Object.keys(errorMessage).length) {
        this.logger.log(errorMessage);
        throw new Error('Has error property');
      }

      s3ObjectsToDelete.push({ bucket, key });
      const s3Object = await this.getObject(bucket, key);

      await Promise.all(s3ObjectsToDelete.map((obj) => this.delObject(obj.bucket, obj.key)));

      return s3Object;
    } catch (e) {
      (request.request as RequestNewList).hasUnanalyzableError = true;
      this.logger.warn('Error in clipToLand:', e.stack || e);
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
      // disabling log because it is too verbose -- logs every iteration
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

    const { path, preview = false } = request.request as PreviewListRequest;
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
    // We should not call clip to land if we are in the preview mode.
    if (!preview) {
      const response = await this.clipToLand(geojson, request);
      request.geojson = response.geojson;
    }
    return request;
  }
}
