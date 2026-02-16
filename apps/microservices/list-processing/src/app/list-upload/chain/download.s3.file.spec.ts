import { DownloadS3File } from './download.s3.file';
import { ChainType } from './types';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '@wri-monorepos/aws';
import { HeadObjectCommand } from '@aws-sdk/client-s3';

// Mock AWS SDK S3Client
jest.mock('@aws-sdk/client-s3', () => {
  const actualModule = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actualModule,
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
  };
});

describe('DownloadS3File', () => {
  let service: DownloadS3File;
  let mockConfigService: Partial<ConfigService>;
  let mockS3Service: Partial<S3Service>;
  let mockS3ClientSend: jest.Mock;

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

    // Get the mock send function from the S3Client instance
    mockS3ClientSend = (service as any).s3Client.send;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('File size validation', () => {
    it('should validate file size before downloading', async () => {
      const input: ChainType = { request: { path: 'test/path', organization_database: 'testCO' } };
      const fileDownloadedPath = '/tmp/test/path';

      // Mock HeadObjectCommand to return file size under 128MB
      mockS3ClientSend.mockResolvedValue({
        ContentLength: 50 * 1024 * 1024, // 50MB
      });

      (mockS3Service.writeS3fileIntoTmp as jest.Mock).mockResolvedValue(fileDownloadedPath);

      const result = await service.handle(input);

      expect(mockS3ClientSend).toHaveBeenCalledWith(expect.any(HeadObjectCommand));
      expect(mockS3Service.writeS3fileIntoTmp).toHaveBeenCalledWith('test/path', 'test-bucket');
      expect(result.request.fileDownloadedPath).toBe(fileDownloadedPath);
    });

    it('should reject file over 128MB before downloading', async () => {
      const input: ChainType = {
        request: { path: 'test/large-file.csv', organization_database: 'testCO' },
      };

      // Mock HeadObjectCommand to return file size over 128MB
      mockS3ClientSend.mockResolvedValue({
        ContentLength: 150 * 1024 * 1024, // 150MB
      });

      await expect(service.handle(input)).rejects.toThrow(
        'Your file is too large (150.00MB). The maximum file size is 128MB'
      );

      expect(mockS3ClientSend).toHaveBeenCalledWith(expect.any(HeadObjectCommand));
      // Should NOT attempt to download the file
      expect(mockS3Service.writeS3fileIntoTmp).not.toHaveBeenCalled();
    });

    it('should reject very large file (590MB) before downloading', async () => {
      const input: ChainType = {
        request: { path: 'test/huge-file.csv', organization_database: 'testCO' },
      };

      // Mock HeadObjectCommand to return file size 590MB
      mockS3ClientSend.mockResolvedValue({
        ContentLength: 590 * 1024 * 1024, // 590MB
      });

      await expect(service.handle(input)).rejects.toThrow(
        'Your file is too large (590.00MB). The maximum file size is 128MB'
      );

      expect(mockS3ClientSend).toHaveBeenCalledWith(expect.any(HeadObjectCommand));
      expect(mockS3Service.writeS3fileIntoTmp).not.toHaveBeenCalled();
    });

    it('should allow file exactly 128MB', async () => {
      const input: ChainType = {
        request: { path: 'test/exact-size.csv', organization_database: 'testCO' },
      };
      const fileDownloadedPath = '/tmp/test/exact-size.csv';

      // Mock HeadObjectCommand to return exactly 128MB
      mockS3ClientSend.mockResolvedValue({
        ContentLength: 128 * 1024 * 1024, // Exactly 128MB
      });

      (mockS3Service.writeS3fileIntoTmp as jest.Mock).mockResolvedValue(fileDownloadedPath);

      const result = await service.handle(input);

      expect(mockS3ClientSend).toHaveBeenCalledWith(expect.any(HeadObjectCommand));
      expect(mockS3Service.writeS3fileIntoTmp).toHaveBeenCalledWith(
        'test/exact-size.csv',
        'test-bucket'
      );
      expect(result.request.fileDownloadedPath).toBe(fileDownloadedPath);
    });

    it('should handle S3 HeadObject errors gracefully', async () => {
      const input: ChainType = {
        request: { path: 'test/non-existent.csv', organization_database: 'testCO' },
      };

      // Mock HeadObjectCommand to throw an error
      mockS3ClientSend.mockRejectedValue(new Error('NoSuchKey: The specified key does not exist'));

      await expect(service.handle(input)).rejects.toThrow('Unable to check file size in S3');

      expect(mockS3ClientSend).toHaveBeenCalledWith(expect.any(HeadObjectCommand));
      expect(mockS3Service.writeS3fileIntoTmp).not.toHaveBeenCalled();
    });
  });

  it('should download the file and call the next handler', async () => {
    const input: ChainType = { request: { path: 'test/path', organization_database: 'testCO' } };
    const fileDownloadedPath = '/tmp/test/path';

    // Mock HeadObjectCommand
    mockS3ClientSend.mockResolvedValue({
      ContentLength: 50 * 1024 * 1024, // 50MB
    });

    (mockS3Service.writeS3fileIntoTmp as jest.Mock).mockResolvedValue(fileDownloadedPath);

    const result = await service.handle(input);

    expect(mockS3Service.writeS3fileIntoTmp).toHaveBeenCalledWith('test/path', 'test-bucket');
    expect(result.request.fileDownloadedPath).toBe(fileDownloadedPath);
  });

  it('should retry downloading the file on failure and eventually succeed', async () => {
    const input: ChainType = { request: { path: 'test/path', organization_database: 'testCO' } };
    const fileDownloadedPath = '/tmp/test/path';

    // Mock HeadObjectCommand
    mockS3ClientSend.mockResolvedValue({
      ContentLength: 50 * 1024 * 1024, // 50MB
    });

    (mockS3Service.writeS3fileIntoTmp as jest.Mock)
      .mockRejectedValueOnce(new Error('S3 error'))
      .mockResolvedValueOnce(fileDownloadedPath);

    const result = await service.handle(input);

    expect(mockS3Service.writeS3fileIntoTmp).toHaveBeenCalledTimes(2);
    expect(result.request.fileDownloadedPath).toBe(fileDownloadedPath);
  });

  it('should throw an error after max retries', async () => {
    const input: ChainType = { request: { path: 'test/path', organization_database: 'testCO' } };

    // Mock HeadObjectCommand
    mockS3ClientSend.mockResolvedValue({
      ContentLength: 50 * 1024 * 1024, // 50MB
    });

    (mockS3Service.writeS3fileIntoTmp as jest.Mock).mockRejectedValue(new Error('S3 error'));

    await expect(service.handle(input)).rejects.toThrow('S3 error');
    expect(mockS3Service.writeS3fileIntoTmp).toHaveBeenCalledTimes(3);
  }, 15000);
});
