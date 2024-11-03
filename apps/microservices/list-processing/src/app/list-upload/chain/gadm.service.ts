import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest } from './types';
import asyncPool from 'tiny-async-pool';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { IFeatureSet, IGeometry, queryFeatures } from '@esri/arcgis-rest-feature-service';
import { LambdaClient, InvokeCommand, InvocationType } from '@aws-sdk/client-lambda';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { S3Service } from '@wri-monorepos/aws';
import { performance } from 'perf_hooks';
import { getDurationAsString } from './shared';

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

  /**
   * Function to perform a GET request using axios.
   * @param {number} longitude - The longitude of the location.
   * @param {number} latitude - The latitude of the location.
   * @returns {Promise} - A promise that resolves to the query result.
   */
  async queryGADM(feature: Feature): Promise<IFeatureSet> {
    return (await queryFeatures({
      url: this.getGadmServiceUrl(),
      geometry: {
        x: feature.properties.longitude,
        y: feature.properties.latitude,
        spatialReference: {
          wkid: 4326,
        },
      } as IGeometry,
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: ['gadmid', 'name_0', 'name_1', 'name_2'],
    })) as IFeatureSet;
  }

  getGeoReferenceData = async (feature: Feature) => {
    const response = await this.queryGADM(feature);
    if (response.features && response.features.length > 0) {
      feature.properties = {
        ...feature.properties,
        substate: response.features[0].attributes.name_2,
        state: response.features[0].attributes.name_1,
        country: response.features[0].attributes.name_0,
        gadmid: response.features[0].attributes.gadmid,
      };
    }
  };

  clipToLand = async (geojson): Promise<{ geojson: FeatureCollection }> => {
    return new Promise((resolve, reject) => {
      const s3ObjectsToDelete = [];
      const objectName = `gadm-${new Date().getTime()}`;
      this.putObject(objectName, { geojson: geojson })
        .then((location_info) => {
          const s3Info = {
            bucket: process.env.AWS_ANALYSIS_BUCKET,
            key: location_info,
          };
          s3ObjectsToDelete.push(s3Info);

          return this.invokeLambda('controller-admin-areas', {
            receipt_handle: 'NOTARECEIPT',
            s3_location_info: s3Info,
            layer: 'gadm',
            dissolve_aoi: false,
            post_process_aoi: false,
          });
        })
        .then((lambdaResult) => {
          const { Payload } = lambdaResult;
          const { bucket, key, errorMessage } = JSON.parse(Payload);

          if (errorMessage) {
            this.logger.log(errorMessage);
            throw new Error('Has error property');
          }

          s3ObjectsToDelete.push({ bucket, key });
          return this.getObject(bucket, key);
        })
        .then((s3Object) => {
          Promise.all(s3ObjectsToDelete.map((obj) => this.delObject(obj.bucket, obj.key)));
          resolve(s3Object);
        })
        .catch((e) => {
          this.logger.log(e);
          reject(e);
        });
    });
  };

  composeResults = async (feature: Feature) => {
    await this.getGeoReferenceData(feature);
  };

  async handle(input: ChainType): Promise<ChainType> {
    const start = performance.now();
    const { geojson } = input;
    const { path, preview = false } = input.request as PreviewListRequest;
    const { features } = geojson as FeatureCollection;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const undefRet of asyncPool(POOL_SIZE, features, this.composeResults)) {
      // disabling log because it is too verbose -- logs every iteration
      // this.logger.log(`(${path}) - one more feature processed`);
    }
    this.logger.debug('GADMService - done with getGeoReferenceData for', path);
    // We should not call clip to land if we are in the preview mode.
    if (!preview) {
      const response = await this.clipToLand(geojson);
      input.geojson = response.geojson;
    }

    const end = performance.now();
    this.logger.log(`Execution time: ${getDurationAsString(start, end)}`);
    return super.handle(input);
  }
}
