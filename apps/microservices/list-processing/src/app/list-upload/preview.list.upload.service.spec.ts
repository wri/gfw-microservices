import { Test, TestingModule } from '@nestjs/testing';
import { PreviewListUploadService } from './preview.list.upload.service';
import { S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { DownloadS3File } from './chain/download.s3.file';
import { FeatureCollection } from '@wri-monorepos/geo';

jest.mock('./chain/download.s3.file');
jest.mock('./chain/parser.data');
jest.mock('./chain/gadm.service');

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
});
