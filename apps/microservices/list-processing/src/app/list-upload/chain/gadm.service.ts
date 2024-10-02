import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';
import asyncPool from 'tiny-async-pool';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { IFeatureSet, IGeometry, queryFeatures } from '@esri/arcgis-rest-feature-service';
import { LambdaClient, InvokeCommand, InvocationType } from '@aws-sdk/client-lambda';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { S3Service } from '@wri-monorepos/aws';

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

  composeResults = async (feature: Feature) => {
    await this.getGeoReferenceData(feature);
  };

  async handle(input: ChainType): Promise<ChainType> {
    const { geojson } = input;
    const { listId } = input.request;
    const { features } = geojson as FeatureCollection;

    for await (const localPage of asyncPool(POOL_SIZE, features, this.composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }

    return super.handle(input);
  }
}
