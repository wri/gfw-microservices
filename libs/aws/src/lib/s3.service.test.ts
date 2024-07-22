import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
  createWriteStream: jest.fn(),
}));

describe('S3Service', () => {
  let service: S3Service;
  let s3ClientMock: jest.Mocked<S3Client>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: S3Client,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    s3ClientMock = module.get<S3Client>(S3Client) as jest.Mocked<S3Client>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFileSignedUrl', () => {
    it('should return a signed URL', async () => {
      const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
      mockGetSignedUrl.mockResolvedValue('signed-url');

      const url = await service.getFileSignedUrl('test', 'txt', 'test-bucket');

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(GetObjectCommand),
        { expiresIn: 86400 }
      );
      expect(url).toBe('signed-url');
    });
  });

  describe('getFileSignedUrlDynamicEnvironment', () => {
    it('should return a signed URL with dynamic environment', async () => {
      const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
      mockGetSignedUrl.mockResolvedValue('signed-url');

      const url = await service.getFileSignedUrlDynamicEnvironment(
        'test',
        'txt',
        'test-bucket',
        'dev',
        'subpath'
      );

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(GetObjectCommand),
        { expiresIn: 86400 }
      );
      expect(url).toBe('signed-url');
    });
  });
});
