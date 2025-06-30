import { GenerateErrorFile } from './generate.error.file';
import { ChainType } from './types';
import * as fs from 'fs';
import * as path from 'path';
import { S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

interface ServerConfigType {
  LARGE_PROCESSING_LIST_ERROR_BUCKET?: string;
  NODE_ENV?: 'test' | 'development' | 'staging' | 'qa' | 'ProdV2';
}

describe('GenerateErrorFile', () => {
  let handler: GenerateErrorFile;
  let mockInput: ChainType;
  let s3Service: S3Service;
  let configService: ConfigService;

  const mockConfigService: Partial<ConfigService<ServerConfigType, true>> = {
    get: jest.fn((key) => {
      if (key === 'LARGE_PROCESSING_LIST_ERROR_BUCKET') {
        return 'test-bucket';
      }
      return undefined;
    }),
  };

  beforeEach(async () => {
    process.env.LARGE_PROCESSING_LIST_BUCKET = 'test-bucket';
    process.env.NODE_ENV = 'test';

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: S3Service,
          useValue: {
            writeFileToS3: jest.fn().mockResolvedValue(undefined),
            getFileSignedUrl: jest.fn().mockResolvedValue('https://test-url.com'),
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    s3Service = moduleRef.get<S3Service>(S3Service);
    configService = moduleRef.get<ConfigService<any, any>>(ConfigService);
    handler = new GenerateErrorFile(
      s3Service,
      configService as unknown as ConfigService<ServerConfigType, true>
    );

    mockInput = {
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
      request: {
        list_name: 'test-list',
        list_id: 1,
        organization_database: 'test_org',
      },
    } as unknown as ChainType;
  });

  it('should generate CSV file and upload to S3 for features with errors', async () => {
    // Mock data
    mockInput.geojson.features = [
      {
        type: 'Feature',
        properties: {
          locationName: 'Location 1',
          errorDetails: ['Invalid latitude', 'Missing field'],
        },
        geometry: null,
      },
      {
        type: 'Feature',
        properties: {
          locationName: 'Location 2',
          errorDetails: 'Invalid coordinates',
        },
        geometry: null,
      },
    ];

    // Mock fs.promises methods
    jest.spyOn(fs.promises, 'mkdir').mockImplementation(async () => undefined);
    jest.spyOn(fs.promises, 'writeFile').mockImplementation(async () => undefined);

    await handler.handle(mockInput);

    const expectedFilePath = path.join('/tmp', 'test-list_error_report.csv');
    const expectedS3Key = `${process.env.NODE_ENV}/failed/test-list_error_report.csv`;

    expect(fs.promises.mkdir).toHaveBeenCalledWith('/tmp', { recursive: true });
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      '"Location Name","Details"\n"Location 1","Invalid latitude; Missing field"\n"Location 2","Invalid coordinates"'
    );
    expect(s3Service.writeFileToS3).toHaveBeenCalledWith(
      expectedFilePath,
      'text/csv',
      'test-bucket',
      expectedS3Key
    );
    expect(configService.get).toHaveBeenCalledWith('LARGE_PROCESSING_LIST_ERROR_BUCKET', {
      infer: true,
    });
  });

  it('should skip CSV generation when no errors exist', async () => {
    mockInput.geojson.features = [
      {
        type: 'Feature',
        properties: {
          locationName: 'Location 1',
        },
        geometry: null,
      },
    ];

    jest.spyOn(fs.promises, 'mkdir').mockImplementation(async () => undefined);
    jest.spyOn(fs.promises, 'writeFile').mockImplementation(async () => undefined);

    await handler.handle(mockInput);

    expect(fs.promises.writeFile).not.toHaveBeenCalled();
    expect(s3Service.writeFileToS3).not.toHaveBeenCalled();
  });

  afterEach(() => {
    jest.resetAllMocks();
    delete process.env.LARGE_PROCESSING_LIST_BUCKET;
    delete process.env.NODE_ENV;
  });
});
