import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { S3Service } from '@wri-monorepos/aws';
import { DownloadS3File } from './download.s3.file';
import { ChainType } from './types';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'LARGE_PROCESSING_LIST_BUCKET') {
      return 'your-bucket-name';
    }
    return null;
  }),
};

describe('DownloadS3File', () => {
  let service: DownloadS3File;
  let configService: ConfigService;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: S3Service,
          useValue: {
            writeS3fileIntoTmp: jest.fn(),
          },
        },
        { provide: Logger, useValue: mockLogger },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    s3Service = module.get<S3Service>(S3Service);
    service = new DownloadS3File(s3Service, configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should download the file and call the next handler', async () => {
    const input: ChainType = { request: { path: 'test/path', organization_database: 'testCO' } };
    const fileDownloadedPath = '/tmp/test/path';
    (s3Service.writeS3fileIntoTmp as jest.Mock).mockResolvedValue(fileDownloadedPath);

    const result = await service.handle(input);

    expect(s3Service.writeS3fileIntoTmp).toHaveBeenCalledWith('test/path', 'your-bucket-name');
    expect(result.request.fileDownloadedPath).toBe(fileDownloadedPath);
  });

  it('should retry downloading the file on failure and eventually succeed', async () => {
    const input: ChainType = { request: { path: 'test/path', organization_database: 'testCO' } };
    const fileDownloadedPath = '/tmp/test/path';
    (s3Service.writeS3fileIntoTmp as jest.Mock)
      .mockRejectedValueOnce(new Error('S3 error'))
      .mockResolvedValueOnce(fileDownloadedPath);

    const result = await service.handle(input);

    expect(s3Service.writeS3fileIntoTmp).toHaveBeenCalledTimes(2);
    expect(result.request.fileDownloadedPath).toBe(fileDownloadedPath);
  });

  it('should throw an error after max retries', async () => {
    const input: ChainType = { request: { path: 'test/path', organization_database: 'testCO' } };
    (s3Service.writeS3fileIntoTmp as jest.Mock).mockRejectedValue(new Error('S3 error'));

    await expect(service.handle(input)).rejects.toThrow('S3 error');

    expect(s3Service.writeS3fileIntoTmp).toHaveBeenCalledTimes(3);
  }, 10000);
});
