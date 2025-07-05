import { DownloadS3File } from './download.s3.file';
import { ChainType } from './types';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '@wri-monorepos/aws';

describe('DownloadS3File', () => {
  let service: DownloadS3File;
  let mockConfigService: Partial<ConfigService>;
  let mockS3Service: Partial<S3Service>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'LARGE_PROCESSING_LIST_BUCKET') {
          return 'test-bucket';
        }
        return null;
      }),
    };

    mockS3Service = {
      writeS3fileIntoTmp: jest.fn(),
    };

    service = new DownloadS3File(
      mockS3Service as S3Service,
      mockConfigService as ConfigService<any, any>
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should download the file and call the next handler', async () => {
    const input: ChainType = { request: { path: 'test/path', organization_database: 'testCO' } };
    const fileDownloadedPath = '/tmp/test/path';
    (mockS3Service.writeS3fileIntoTmp as jest.Mock).mockResolvedValue(fileDownloadedPath);

    const result = await service.handle(input);

    expect(mockS3Service.writeS3fileIntoTmp).toHaveBeenCalledWith('test/path', 'test-bucket');
    expect(result.request.fileDownloadedPath).toBe(fileDownloadedPath);
  });

  it('should retry downloading the file on failure and eventually succeed', async () => {
    const input: ChainType = { request: { path: 'test/path', organization_database: 'testCO' } };
    const fileDownloadedPath = '/tmp/test/path';
    (mockS3Service.writeS3fileIntoTmp as jest.Mock)
      .mockRejectedValueOnce(new Error('S3 error'))
      .mockResolvedValueOnce(fileDownloadedPath);

    const result = await service.handle(input);

    expect(mockS3Service.writeS3fileIntoTmp).toHaveBeenCalledTimes(2);
    expect(result.request.fileDownloadedPath).toBe(fileDownloadedPath);
  });

  it('should throw an error after max retries', async () => {
    const input: ChainType = { request: { path: 'test/path', organization_database: 'testCO' } };
    (mockS3Service.writeS3fileIntoTmp as jest.Mock).mockRejectedValue(new Error('S3 error'));

    await expect(service.handle(input)).rejects.toThrow('S3 error');
    expect(mockS3Service.writeS3fileIntoTmp).toHaveBeenCalledTimes(3);
  }, 15000);
});
