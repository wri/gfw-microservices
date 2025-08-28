import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest, RequestNewList } from './types';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import axios from 'axios';
import axiosRetry from 'axios-retry';
// We're using wkx because wellknown only handles wkt instead of wkb
import wkx from 'wkx';

axiosRetry(axios, {
  retries: 6,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // axios-retry normally does not retry POSTs, so using a custom condition
    return (
      axiosRetry.isRetryableError(error) ||
      error.response?.status === 429 ||
      error.response?.status === 500 ||
      error.response?.status === 502
    );
  },
});
const DEFAULT_DELAY = 1000;
export class ClipToLandService extends AbstractHandler<ChainType> {
  logger = new Logger(ClipToLandService.name);

  private BATCH_SIZE = 200;
  getClipToLandData = async (feature: any) => {
    const requestData = {
      geometry: feature.geometry,
      sql: `SELECT ST_UNION(ST_Intersection(geom, ST_setSRID(ST_GeomFromGeoJSON('{"type": "${
        feature.geometry.type
      }", "coordinates": ${JSON.stringify(
        feature.geometry.coordinates
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
      const buffer = Buffer.from(response.data?.data[0].st_union, 'hex');
      const geometry = wkx.Geometry.parse(buffer);
      const geometryToGeoJson = geometry.toGeoJSON();
      const payload = {
        properties: feature.properties,
        geometry: geometryToGeoJson,
        type: 'FeatureCollection',
      };
      return payload;
    } catch (error) {
      const statusCode = error.response?.status;

      this.logger.warn(`ERROR in request (HTTP ${statusCode}):`, error.message);
      this.logger.warn(
        `Returning feature without geometry for feature ${
          feature.properties?.locationName || 'unknown'
        }`
      );
      const payload = {
        properties: {
          ...feature.properties,
          errorDetails: `ERROR in request (HTTP ${statusCode}): ${error.message}`,
        },
        geometry: null,
        type: 'FeatureCollection',
      };
      // Add a small delay before rethrowing
      if (error.response?.status !== 429) {
        await new Promise((resolve) => setTimeout(resolve, DEFAULT_DELAY));
      }

      return payload;
    }
  };

  private async processBatch(batch: Feature[], request: ChainType): Promise<Feature[]> {
    // remove extra geometry properties if they exist
    batch.forEach((feature) => {
      if (feature.properties && feature.properties.geometry) {
        delete feature.properties.geometry;
      }
    });

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
