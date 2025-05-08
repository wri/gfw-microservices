import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AnalysisAfiDataService, AnalysisDataService } from '../data';
import { AfiGeometryService } from '../files';
import { AfiVcGeneratorService } from './afi.vc.generator.service';
import { UspGetListAnalysis } from '@wri-monorepos/sql';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import tsMockito from 'ts-mockito';


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
        { provide: EmailService, useValue: tsMockito.mock(EmailService) },
        S3Service
      ],
    })
 
      .compile();

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

    it('should run runAfiFileGeneration', async () => {
      const mockFilters = {
        organizationDatabase: 'example-database',
        userEmail: 'user@example.com',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        key: 'example-file.csv',
        file: 'shapefile',
        type: 'afiVC',
      };
      const result = await fileGenerator['defineService']({
        ...mockFilters,
      });
      expect(result).toBeUndefined();
    });
  });
});
