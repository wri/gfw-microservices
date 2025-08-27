import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest, RequestNewList } from './types';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { LambdaClient, InvokeCommand, InvocationType } from '@aws-sdk/client-lambda';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { S3Service } from '@wri-monorepos/aws';
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // axios-retry normally does not retry POSTs, so using a custom condition
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 429 ||
      error.response?.status === 500 ||
      error.response?.status === 502
    );
  },
});
const DEFAULT_DELAY = 500;
export class ClipToLandService extends AbstractHandler<ChainType> {
  logger = new Logger(ClipToLandService.name);

  LAMBDA_HTTP_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  private BATCH_SIZE = 200;

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

  getClipToLandData = async (feature: Feature) => {
    const requestData = {
      geometry: feature.geometry,
      sql: `SELECT ST_UNION(ST_Intersection(geom, ST_setSRID(ST_GeomFromGeoJSON('{"type": "${
        feature.geometry.type
      }", "coordinates": ${JSON.stringify(
        feature.geometry.geometries[0].coordinates
      )}}') , 4326 ) ) ) FROM mytable WHERE adm_level='2'`,
    };

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
      if (!response.data.data || !response.data.data[0] || !response.data.data[0].st_union) {
        throw new Error(
          `Unexpected response structure (HTTP ${response.status}): ${JSON.stringify(
            response.data
          )}`
        );
      }

      return response.data?.data;
    } catch (error) {
      const statusCode = error.response?.status;

      console.log(`ERROR in request (HTTP ${statusCode}):`, error.message);
      console.log(
        `Returning feature without geometry for feature ${
          feature.properties?.locationName || 'unknown'
        }`
      );
      const payload = {
        body: {
          features: {
            properties: {
              ...feature.properties,
              errorDetails: `ERROR in request (HTTP ${statusCode}): ${error.message}`,
            },
            geometry: null,
            type: 'FeatureCollection',
          },
        },
      };
      // Add a small delay before rethrowing
      if (error.response?.status !== 429) {
        await new Promise((resolve) => setTimeout(resolve, DEFAULT_DELAY));
      }

      return payload;
    }
  };

  private async processBatch(batch: Feature[], request: ChainType): Promise<Feature[]> {
    const s3ObjectsToDelete = [];
    const objectName = `gadm-${new Date().getTime()}-${Math.random().toString(36).substring(7)}`;

    // remove extra geometry properties if they exist
    batch.forEach((feature) => {
      if (feature.properties && feature.properties.geometry) {
        delete feature.properties.geometry;
      }
    });

    try {
      const batchGeoJSON = {
        type: 'FeatureCollection',
        features: batch,
      };

      const location_info = await this.putObject(objectName, { geojson: batchGeoJSON });
      const s3Info = {
        bucket: process.env.AWS_ANALYSIS_BUCKET,
        key: location_info,
      };
      s3ObjectsToDelete.push(s3Info);

     const result = await Promise.all(batch.map(feature => this.getClipToLandData(feature)));
     console.log(result)
      const lambdaResult = await this.invokeLambda('controller-admin-areas', {
        receipt_handle: 'NOTARECEIPT',
        s3_location_info: s3Info,
        layer: 'gadm',
        dissolve_aoi: false,
        post_process_aoi: false,
        xApiKeyDataApi: process.env.GFW_DATA_API_KEY,
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

      return s3Object.geojson.features;
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

  clipToLand = async (geojson, request): Promise<{ geojson: FeatureCollection }> => {
    const { features } = geojson as FeatureCollection;
    const processedFeatures: Feature[] = [];

    // Process features in batches
    for (let i = 0; i < features.length; i += this.BATCH_SIZE) {
      const batch = features.slice(i, i + this.BATCH_SIZE);
      try {
        const processedBatch = await this.processBatch(batch, request);
        processedFeatures.push(...processedBatch);
      } catch (e) {
        this.logger.warn('Error processing batch:', e);
        processedFeatures.push(...batch); // Add original features if processing fails
      }
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
