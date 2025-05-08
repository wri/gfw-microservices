import { Test, TestingModule } from '@nestjs/testing';
import { ClipToLandService } from './clipToLand.service';
import { S3Service } from '@wri-monorepos/aws';
import { FeatureCollection } from '@wri-monorepos/geo';
import { ChainType, RequestNewList } from './types';

jest.mock('@wri-monorepos/aws');
jest.mock('@aws-sdk/client-lambda');
jest.mock('@wri-monorepos/shared', () => ({
  featureFlagsService: jest.fn(),
}));

describe('ClipToLandService', () => {
  let service: ClipToLandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClipToLandService, S3Service],
    }).compile();

    service = module.get<ClipToLandService>(ClipToLandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      const geojson: FeatureCollection = {
        type: 'FeatureCollection',
        features,
      };
      const request = {
        request: { list_id: 1, organization_database: 'test', path: 'test' } as RequestNewList,
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

      let batchCounter = 0;
      jest.spyOn(service, 'getObject').mockImplementation(async () => {
        // Return the same batch of features that was sent
        const batchSize = 200;
        const start = batchCounter * batchSize;
        const end = Math.min(start + batchSize, features.length);
        const batchFeatures = features.slice(start, end).map((f) => ({
          ...f,
          properties: { ...f.properties, processed: true },
        }));
        batchCounter++;
        return {
          geojson: {
            type: 'FeatureCollection',
            features: batchFeatures,
          },
        };
      });
      jest.spyOn(service, 'delObject').mockResolvedValue(undefined);

      const result = await service.clipToLand(geojson, request);

      // Verify all features were processed
      expect(result.geojson.features).toHaveLength(500);
      expect(result.geojson.features.every((f) => f.properties.processed)).toBe(true);
    });

    it('should handle empty feature collection', async () => {
      const geojson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      };
      const request = {
        request: { list_id: 1, organization_database: 'test', path: 'test' } as RequestNewList,
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
      const geojson: FeatureCollection = {
        type: 'FeatureCollection',
        features,
      };
      const request = {
        request: { list_id: 1, organization_database: 'test', path: 'test' } as RequestNewList,
      };

      // Mock Lambda to throw error
      jest.spyOn(service, 'invokeLambda').mockRejectedValue(new Error('Lambda error'));

      const result = await service.clipToLand(geojson, request);

      // Verify result contains all original features
      expect(result.geojson.features).toHaveLength(300);
      expect(request.request.hasUnanalyzableError).toBe(true);
    });
  });
});
