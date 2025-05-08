import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import * as tsMockito from 'ts-mockito';
import * as fs from 'fs';
import { AccountUsersAnalysisUsageFileService } from './account-users-usage.generator.service';
import { EmailService, S3Service } from '@wri-monorepos/aws';

// Mock do S3Service
const errorFileStoragePath = 's3://bucketname/enviroment/status/erro_name_result.file_extension';
const mockS3ServiceOverride = {
  getFileSignedUrlDynamicEnvironment: jest.fn().mockResolvedValue(errorFileStoragePath),
  getFileSignedUrl: jest.fn().mockResolvedValue('https://example.com/signed-url'),
  writeFileToS3: jest.fn().mockResolvedValue(true),
};
describe('AccountUsersAnalysisUsageFileGenerator', () => {
  let fileGenerator: AccountUsersAnalysisUsageFileService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockEmailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      providers: [
        AccountUsersAnalysisUsageFileService,
        { provide: EmailService, useValue: tsMockito.mock(EmailService) },
        S3Service,
      ],
    })
      .overrideProvider(S3Service)
      .useValue(mockS3ServiceOverride)
      .compile();

    fileGenerator = module.get<AccountUsersAnalysisUsageFileService>(
      AccountUsersAnalysisUsageFileService
    );
    mockEmailService = jest.mocked(tsMockito.instance(module.get(EmailService)));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  describe('makeFile', () => {
    it('should generate and upload the file successfully', async () => {
      const mockFilters = {
        organizationDatabase: 'example-database',
        userEmail: 'user@example.com',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        key: 'example-file.csv',
      };

      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(fileGenerator as any, 'getFileContents')
        .mockResolvedValue([['data1', 'data2']] as string[][]);
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(fileGenerator as any, 'generateCsvFile')
        .mockResolvedValue('/tmp/example-database/example-file.csv');
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(fileGenerator as any, 'uploadFileToS3')
        .mockResolvedValue('s3://example-bucket/example-file.csv');
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(fileGenerator as any, 'notifyUserFileGenerationSuccess')
        .mockResolvedValue(undefined);

      // main
      await fileGenerator.makeFile(mockFilters);

      expect(fileGenerator['getFileContents']).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationDatabase: 'example-database',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      );

      expect(fileGenerator['generateCsvFile']).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'example-file.csv',
          directory: 'example-database'.split('-')[1],
          fileContents: [['data1', 'data2']] as string[][],
        })
      );

      expect(fileGenerator['uploadFileToS3']).toHaveBeenCalledWith(
        '/tmp/example-database/example-file.csv'
      );

      expect(fileGenerator['notifyUserFileGenerationSuccess']).toHaveBeenCalledWith(
        expect.objectContaining({
          emailTo: 'user@example.com',
          fileLocation: 's3://example-bucket/example-file.csv',
        })
      );
    });
    it('should generate a failure notification', async () => {
      const mockFilters = {
        organizationDatabase: 'example-database',
        userEmail: 'user@example.com',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        key: 'example-file.csv',
      };

      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(fileGenerator as any, 'getFileContents')
        .mockResolvedValue([['data1', 'data2']] as string[][]);
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(fileGenerator as any, 'generateCsvFile')
        .mockResolvedValue('/tmp/example-database/example-file.csv');
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(fileGenerator as any, 'uploadFileToS3')
        .mockResolvedValue('s3://example-bucket/example-file.csv');
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(fileGenerator as any, 'notifyUserFileGenerationSuccess')
        .mockRejectedValueOnce(new Error('Failed to send email'));

      // main
      await fileGenerator.makeFile(mockFilters);

      expect(fileGenerator['getFileContents']).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationDatabase: 'example-database',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      );

      expect(fileGenerator['generateCsvFile']).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'example-file.csv',
          directory: 'example-database'.split('-')[1],
          fileContents: [['data1', 'data2']] as string[][],
        })
      );

      expect(fileGenerator['uploadFileToS3']).toHaveBeenCalledWith(
        '/tmp/example-database/example-file.csv'
      );

      expect(fileGenerator['notifyUserFileGenerationSuccess']).toHaveBeenCalledWith(
        expect.objectContaining({
          emailTo: 'user@example.com',
          fileLocation: 's3://example-bucket/example-file.csv',
        })
      );
    });

    it('should uploadFileToS3 correctly', async () => {
      const result = await fileGenerator['uploadFileToS3'](
        '/tmp/example-database/example-file.csv'
      );
      expect(result).toBe('https://example.com/signed-url');
    });

    it('should throw an error when uploading to S3', async () => {
      jest
        .spyOn(mockS3ServiceOverride, 'getFileSignedUrl')
        .mockRejectedValue(new Error('S3 upload error'));
      await expect(
        fileGenerator['uploadFileToS3']('/tmp/example-database/example-file.csv')
      ).rejects.toThrow('S3 upload error');
    });

    it('should generate generateCsvFile', async () => {
      jest.spyOn(fs, 'mkdirSync').mockReturnValue(undefined);
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      jest.spyOn(fs, 'unlinkSync').mockReturnValue(undefined);
      jest.spyOn(fs, 'readFileSync').mockReturnValue('data1,data2\n');
      jest.spyOn(fs, 'createReadStream').mockReturnValue({
        on: jest.fn(),
        pipe: jest.fn(),
      } as unknown as fs.ReadStream);

      const result = await fileGenerator['generateCsvFile']({
        fileName: 'example-file.csv',
        directory: 'example-database',
        fileContents: [['data1', 'data2']],
      });
      expect(result).toBe('/tmp/example-database/example-file.csv');
    });
    it(' should notifyUserFileGenerationSuccess', async () => {
      const mockFilters = {
        organizationDatabase: 'example-database',
        userEmail: 'email@email',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        key: 'example-file.csv',
      };
      const fileLocation = 's3://example-bucket/example-file.csv';
      const result = await fileGenerator['notifyUserFileGenerationSuccess']({
        emailTo: mockFilters.userEmail,
        fileLocation,
      });
      expect(result).toBeUndefined();
    });
  });
});
