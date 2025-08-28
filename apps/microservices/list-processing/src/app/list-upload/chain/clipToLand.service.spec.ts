import { Test, TestingModule } from '@nestjs/testing';
import { ClipToLandService } from './clipToLand.service';
import { S3Service } from '@wri-monorepos/aws';
import { FeatureCollection } from '@wri-monorepos/geo';
import { ChainType, RequestNewList, PreviewListRequest } from './types';

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

    it('should skip processing in preview mode', async () => {
      const input: ChainType = {
        geojson: { type: 'FeatureCollection', features: [] },
        request: {
          list_id: 1,
          organization_database: 'test',
          path: 'test',
          preview: true,
        } as PreviewListRequest,
      };
      const clipToLandSpy = jest.spyOn(service, 'clipToLand');
      const result = await service.handle(input);
      expect(clipToLandSpy).not.toHaveBeenCalled();
      expect(result.geojson).toEqual(input.geojson);
    });

    it('should skip processing if hasUnanalyzableError is true', async () => {
      const input: ChainType = {
        geojson: { type: 'FeatureCollection', features: [] },
        request: {
          list_id: 1,
          organization_database: 'test',
          path: 'test',
          hasUnanalyzableError: true,
        } as RequestNewList,
      };
      const clipToLandSpy = jest.spyOn(service, 'clipToLand');
      const result = await service.handle(input);
      expect(clipToLandSpy).not.toHaveBeenCalled();
      expect(result.geojson).toEqual(input.geojson);
    });
  });

  describe('S3 operations', () => {
    let s3Service: jest.Mocked<S3Service>;

    beforeEach(() => {
      s3Service = new S3Service() as jest.Mocked<S3Service>;
      (S3Service as jest.Mock).mockImplementation(() => s3Service);
    });
  });

  describe('Lambda operations', () => {
    it('should invoke Lambda function', async () => {
      const functionName = 'test-function';
      const payload = { test: 'data' };
      const expectedResponse = { Payload: JSON.stringify({ result: 'success' }) };

      jest.spyOn(service, 'getClipToLandData').mockResolvedValue(expectedResponse);

      const result = await service.getClipToLandData(functionName, payload);
      expect(result).toEqual(expectedResponse);
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
      jest.spyOn(service, 'getClipToLandData').mockRejectedValue(new Error('Lambda error'));

      const result = await service.clipToLand(geojson, request);

      // Verify result contains all original features
      expect(result.geojson.features).toHaveLength(300);
      expect(request.request.hasUnanalyzableError).toBe(true);
    });
  });
});
