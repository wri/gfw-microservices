import { Test, TestingModule } from '@nestjs/testing';
import { ClipToLandService } from './clipToLand.service';
import { S3Service } from '@wri-monorepos/aws';
import { Feature } from '@wri-monorepos/geo';
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

  describe('Lambda operations', () => {
    it('should process features in batches', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { test: 'data' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      const expectedResponse: Feature = {
        type: 'Feature',
        properties: { test: 'data' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };

      jest.spyOn(service, 'getClipToLandData').mockResolvedValue(expectedResponse);

      const result = await service.getClipToLandData(feature);
      expect(result).toEqual(expectedResponse);
    });
  });
});
