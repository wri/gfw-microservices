import { Test, TestingModule } from '@nestjs/testing';
import { AccountUsersAnalysisUsageFileService } from './account-users-usage.generator.service';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import * as tsMockito from 'ts-mockito';

describe('AccountUsersAnalysisUsageFileGenerator', () => {
  let fileGenerator: AccountUsersAnalysisUsageFileService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockEmailService: EmailService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockS3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountUsersAnalysisUsageFileService,
        { provide: EmailService, useValue: tsMockito.mock(EmailService) },
        { provide: S3Service, useValue: tsMockito.mock(S3Service) },
      ],
    }).compile();

    fileGenerator = module.get<AccountUsersAnalysisUsageFileService>(
      AccountUsersAnalysisUsageFileService
    );
    mockEmailService = jest.mocked(tsMockito.instance(module.get(EmailService)));
    mockS3Service = jest.mocked(tsMockito.instance(module.get(S3Service)));
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
        .mockResolvedValue([['data1', 'data2']] as any);
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
          fileContents: [['data1', 'data2']] as any,
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
  });
});
