// Mock ConvertPoint2Polygon to avoid dynamic import requirements (must be before imports)
jest.mock('./chain/convert.point.2.polygon', () => {
  const { AbstractHandler } = jest.requireActual('./chain/types');
  class MockConvertPoint2Polygon extends AbstractHandler<unknown> {
    setNext() {
      return this;
    }
    async handle(request: unknown) {
      return Promise.resolve(request);
    }
  }
  return {
    ConvertPoint2Polygon: MockConvertPoint2Polygon,
  };
});

// Mock AdjustGeoData
jest.mock('./chain/adjust.geo.data', () => {
  const { AbstractHandler } = jest.requireActual('./chain/types');
  class MockAdjustGeoData extends AbstractHandler<unknown> {
    setNext() {
      return this;
    }
    async handle(request: unknown) {
      return Promise.resolve(request);
    }
  }
  return {
    AdjustGeoData: MockAdjustGeoData,
  };
});

jest.mock('./chain/download.s3.file');
jest.mock('./chain/parser.data');
jest.mock('./chain/gadm.service');

import { Test, TestingModule } from '@nestjs/testing';
import { PreviewListUploadService } from './preview.list.upload.service';
import { S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { DownloadS3File } from './chain/download.s3.file';
import { FeatureCollection } from '@wri-monorepos/geo';

describe('ListUploadService', () => {
  let service: PreviewListUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreviewListUploadService,
        {
          provide: S3Service,
          useValue: {
            // Mock methods if needed
          },
        },
        {
          provide: ConfigService,
          useValue: {
            // Mock methods if needed
          },
        },
      ],
    }).compile();

    service = module.get<PreviewListUploadService>(PreviewListUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a FeatureCollection when previewData is called', async () => {
    const path = 'test/path';
    const mockFeatureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };

    const mockChainType = {
      request: {
        path,
        preview: true,
      },
      geojson: mockFeatureCollection,
    };

    (DownloadS3File as unknown as jest.Mock).mockImplementation(() => ({
      setNext: jest.fn().mockReturnThis(),
      handle: jest.fn().mockResolvedValue(mockChainType),
    }));

    const result = await service.previewData(path);

    expect(result).toEqual(mockFeatureCollection);
  });

  it('should not throw exception when errors contain only UML lookup errors', async () => {
    const path = 'test/path';
    const mockFeatureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            errorDetails: ['UML LookUp: did not found lat/long for location1'],
          },
        },
      ],
    };

    const mockChainType = {
      request: {
        path,
        preview: true,
      },
      geojson: mockFeatureCollection,
    };

    (DownloadS3File as unknown as jest.Mock).mockImplementation(() => ({
      setNext: jest.fn().mockReturnThis(),
      handle: jest.fn().mockResolvedValue(mockChainType),
    }));

    const result = await service.previewData(path);

    expect(result).toEqual(mockFeatureCollection);
  });

  it('should not throw exception when errors contain only CAR lookup errors', async () => {
    const path = 'test/path';
    const mockFeatureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            errorDetails: ['CAR LookUp: did not found lat/long for location2'],
          },
        },
      ],
    };

    const mockChainType = {
      request: {
        path,
        preview: true,
      },
      geojson: mockFeatureCollection,
    };

    (DownloadS3File as unknown as jest.Mock).mockImplementation(() => ({
      setNext: jest.fn().mockReturnThis(),
      handle: jest.fn().mockResolvedValue(mockChainType),
    }));

    const result = await service.previewData(path);

    expect(result).toEqual(mockFeatureCollection);
  });

  it('should not throw exception when errors contain both UML and CAR lookup errors', async () => {
    const path = 'test/path';
    const mockFeatureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            errorDetails: [
              'UML LookUp: did not found lat/long for location1',
              'CAR LookUp: did not found lat/long for location2',
            ],
          },
        },
      ],
    };

    const mockChainType = {
      request: {
        path,
        preview: true,
      },
      geojson: mockFeatureCollection,
    };

    (DownloadS3File as unknown as jest.Mock).mockImplementation(() => ({
      setNext: jest.fn().mockReturnThis(),
      handle: jest.fn().mockResolvedValue(mockChainType),
    }));

    const result = await service.previewData(path);

    expect(result).toEqual(mockFeatureCollection);
  });

  it('should throw BadRequestException when errors contain significant validation errors', async () => {
    const path = 'test/path';
    const mockFeatureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            errorDetails: ['Invalid coordinate format', 'Missing required field'],
          },
        },
      ],
    };

    const mockChainType = {
      request: {
        path,
        preview: true,
      },
      geojson: mockFeatureCollection,
    };

    (DownloadS3File as unknown as jest.Mock).mockImplementation(() => ({
      setNext: jest.fn().mockReturnThis(),
      handle: jest.fn().mockResolvedValue(mockChainType),
    }));

    await expect(service.previewData(path)).rejects.toThrow('Validation errors found in the data');
  });

  it('should throw BadRequestException when errors contain mix of lookup errors and significant errors', async () => {
    const path = 'test/path';
    const mockFeatureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            errorDetails: [
              'UML LookUp: did not found lat/long for location1',
              'Invalid coordinate format',
              'CAR LookUp: did not found lat/long for location2',
            ],
          },
        },
      ],
    };

    const mockChainType = {
      request: {
        path,
        preview: true,
      },
      geojson: mockFeatureCollection,
    };

    (DownloadS3File as unknown as jest.Mock).mockImplementation(() => ({
      setNext: jest.fn().mockReturnThis(),
      handle: jest.fn().mockResolvedValue(mockChainType),
    }));

    await expect(service.previewData(path)).rejects.toThrow('Validation errors found in the data');
  });
});
