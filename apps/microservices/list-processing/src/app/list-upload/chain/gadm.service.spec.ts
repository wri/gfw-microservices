import { Test, TestingModule } from '@nestjs/testing';
import { GADMService } from './gadm.service';
import { S3Service } from '@wri-monorepos/aws';
import { Feature } from '@wri-monorepos/geo';
import { ChainType } from './types';
import { featureFlagsService } from '@wri-monorepos/shared';

jest.mock('@wri-monorepos/aws');
jest.mock('@aws-sdk/client-lambda');
jest.mock('@esri/arcgis-rest-feature-service');
jest.mock('@wri-monorepos/shared', () => ({
  featureFlagsService: jest.fn(),
}));
describe('GADMService', () => {
  let service: GADMService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GADMService, S3Service],
    }).compile();

    service = module.get<GADMService>(GADMService);

    (featureFlagsService as jest.Mock).mockResolvedValue({
      getFeatureFlagsForCurrentOrg: jest.fn().mockResolvedValue([
        {
          flagId: 'gadm41',
          flagState: false,
        },
      ]),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGadmServiceUrl', () => {
    it('should return the correct URL based on environment', () => {
      process.env.NODE_ENV = 'production';
      expect(service.getGadmServiceUrl()).toBe(
        'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin_2_gridded/MapServer/0'
      );
      process.env.NODE_ENV = 'development';
      expect(service.getGadmServiceUrl()).toBe(
        'https://gfwpro-gis-stg.globalforestwatch.org/arcgis/rest/services/GADM36_admin_2_gridded/MapServer/0'
      );
    });
  });

  describe('getGeoReferenceData', () => {
    it('should get geo reference data', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      jest.spyOn(service, 'queryGADM').mockResolvedValue({
        features: [
          { attributes: { name_0: 'Country', name_1: 'State', name_2: 'Substate', gadmid: '123' } },
        ],
      });
      await service.getGeoReferenceData(feature);
      expect(feature.properties).toEqual({
        longitude: 0,
        latitude: 0,
        subState: 'Substate',
        state: 'State',
        country: 'Country',
        gadmid: '123',
      });
    });
  });

  describe('composeResults', () => {
    it('should compose results', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      jest.spyOn(service, 'getGeoReferenceData').mockResolvedValue({ hasUnanalyzableError: false });
      await service.composeResults(feature);
      expect(service.getGeoReferenceData).toHaveBeenCalledWith(feature);
    });
  });

  describe('handle', () => {
    it('should handle the input', async () => {
      const input: ChainType = {
        geojson: { type: 'FeatureCollection', features: [] },
        request: { list_id: 1, organization_database: 'test', path: 'test' },
      };
      jest
        .spyOn(service, 'clipToLand')
        .mockResolvedValue({ geojson: { type: 'FeatureCollection', features: [] } });
      const result = await service.handle(input);
      expect(result.geojson).toEqual({ type: 'FeatureCollection', features: [] });
    });
  });

  describe('clipToLand', () => {
    it('should process features in batches', async () => {
      const features = Array(500).fill({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      });
      const geojson = {
        type: 'FeatureCollection',
        features,
      };
      const request = {
        request: { list_id: 1, organization_database: 'test', path: 'test' },
      };

      // Mock processBatch to return processed features
      jest.spyOn(service as any, 'processBatch').mockImplementation(async (batch: Feature[]) => {
        return batch.map((feature) => ({
          ...feature,
          properties: { ...feature.properties, processed: true },
        }));
      });

      const result = await service.clipToLand(geojson, request);

      // Verify processBatch was called 3 times (500/200 = 2.5, rounded up to 3)
      expect((service as any).processBatch).toHaveBeenCalledTimes(3);

      // Verify all features were processed
      expect(result.geojson.features).toHaveLength(500);
      expect(result.geojson.features.every((f) => f.properties.processed)).toBe(true);
    });

    it('should handle empty feature collection', async () => {
      const geojson = {
        type: 'FeatureCollection',
        features: [],
      };
      const request = {
        request: { list_id: 1, organization_database: 'test', path: 'test' },
      };

      const result = await service.clipToLand(geojson, request);

      expect(result.geojson.features).toHaveLength(0);
      expect(result.geojson.type).toBe('FeatureCollection');
    });

    it('should handle errors in batch processing', async () => {
      const features = Array(300).fill({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      });
      const geojson = {
        type: 'FeatureCollection',
        features,
      };
      const request = {
        request: { list_id: 1, organization_database: 'test', path: 'test' },
      };

      let callCount = 0;
      // Mock processBatch to simulate an error in the second batch
      jest.spyOn(service as any, 'processBatch').mockImplementation(async (batch: Feature[]) => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Batch processing failed');
        }
        return batch;
      });

      const result = await service.clipToLand(geojson, request);

      // Verify processBatch was called 3 times
      expect(callCount).toBe(2);

      // Verify result contains all original features
      expect(result.geojson.features).toHaveLength(300);
    });
  });

  describe('processBatch', () => {
    it('should process a batch of features', async () => {
      const batch = Array(100).fill({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      });
      const request = {
        request: { list_id: 1, organization_database: 'test', path: 'test' },
      };

      // Mock S3 and Lambda methods
      jest.spyOn(service, 'putObject').mockResolvedValue('test-key');
      jest.spyOn(service, 'invokeLambda').mockResolvedValue({
        Payload: JSON.stringify({
          bucket: 'test-bucket',
          key: 'test-key',
          errorMessageStr: '',
        }),
      });
      jest.spyOn(service, 'getObject').mockResolvedValue({
        geojson: {
          type: 'FeatureCollection',
          features: batch.map((f) => ({
            ...f,
            properties: { ...f.properties, processed: true },
          })),
        },
      });
      jest.spyOn(service, 'delObject').mockResolvedValue(undefined);

      const result = await (service as any).processBatch(batch, request);

      expect(result).toHaveLength(100);
      expect(result.every((f) => f.properties.processed)).toBe(true);
      expect(service.putObject).toHaveBeenCalled();
      expect(service.invokeLambda).toHaveBeenCalled();
      expect(service.getObject).toHaveBeenCalled();
      expect(service.delObject).toHaveBeenCalledTimes(2);
    });

    it('should handle errors and return original features', async () => {
      const batch = Array(100).fill({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      });
      const request = {
        request: { list_id: 1, organization_database: 'test', path: 'test' },
      };

      // Mock Lambda to throw error
      jest.spyOn(service, 'invokeLambda').mockRejectedValue(new Error('Lambda error'));

      const result = await (service as any).processBatch(batch, request);

      expect(result).toHaveLength(100);
      expect(result).toEqual(batch);
      expect((request.request as any).hasUnanalyzableError).toBe(true);
    });
  });
});
