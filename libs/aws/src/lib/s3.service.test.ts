import { Test, TestingModule } from '@nestjs/testing';
import { S3Service, buildContentDisposition } from './s3.service';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

    it('sets ResponseContentDisposition when downloadFilename is provided', async () => {
      const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
      mockGetSignedUrl.mockResolvedValue('signed-url');
      const mockGetObjectCommand = GetObjectCommand as jest.MockedClass<typeof GetObjectCommand>;
      mockGetObjectCommand.mockClear();

      await service.getFileSignedUrl('test', 'zip', 'test-bucket', 'My List_input.zip');

      expect(mockGetObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          ResponseContentDisposition: `attachment; filename="My List_input.zip"; filename*=UTF-8''My%20List_input.zip`,
        })
      );
    });

    it('omits ResponseContentDisposition when no downloadFilename is provided', async () => {
      const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
      mockGetSignedUrl.mockResolvedValue('signed-url');
      const mockGetObjectCommand = GetObjectCommand as jest.MockedClass<typeof GetObjectCommand>;
      mockGetObjectCommand.mockClear();

      await service.getFileSignedUrl('test', 'zip', 'test-bucket');

      const callArgs = mockGetObjectCommand.mock.calls[0][0];
      expect(callArgs.ResponseContentDisposition).toBeUndefined();
    });
  });

  describe('buildContentDisposition', () => {
    it('encodes unicode via filename* and provides an ASCII fallback', () => {
      const result = buildContentDisposition('Test List Café.zip');
      expect(result).toBe(
        `attachment; filename="Test List Caf_.zip"; filename*=UTF-8''Test%20List%20Caf%C3%A9.zip`
      );
    });

    it('escapes quote and backslash characters in the ASCII fallback', () => {
      const result = buildContentDisposition('a"b\\c.zip');
      expect(result).toBe(`attachment; filename="a_b_c.zip"; filename*=UTF-8''a%22b%5Cc.zip`);
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
