import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as tsMockito from 'ts-mockito';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import { AnalysisAfiDataService, AnalysisDataService } from '../data';
import { AfiGeometryService } from '../files';
import { AfiVcGeneratorService } from './afi.vc.generator.service';
import { UspGetListAnalysis } from '@wri-monorepos/sql';

describe('AccountUsersAnalysisUsageFileGenerator', () => {
  let fileGenerator: AfiVcGeneratorService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      providers: [
        AfiVcGeneratorService,
        AnalysisAfiDataService,
        AfiGeometryService,
        UspGetListAnalysis,
        AnalysisDataService,
        Logger,
        { provide: EmailService, useValue: tsMockito.mock(EmailService) },
        S3Service,
      ],
    }).compile();

    fileGenerator = module.get<AfiVcGeneratorService>(AfiVcGeneratorService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  describe('makeFile', () => {
    it('should run make file', async () => {
      const mockFilters = {
        organizationDatabase: 'example-database',
        userEmail: 'user@example.com',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        key: 'example-file.csv',
        file: 'shapefile',
        type: 'afiVC',
      };
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(fileGenerator as any, 'runAfiFileGeneration')
        .mockResolvedValue(true);
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(fileGenerator as any, 'defineService')
        .mockImplementation(() => {
          return {
            finish: jest.fn().mockResolvedValue(true),
          };
        });

      const result = await fileGenerator.makeFile(mockFilters);
      expect(result).toBeUndefined();
    });
  });
});
