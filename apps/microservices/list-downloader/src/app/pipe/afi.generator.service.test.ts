import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NaturalForestLossService, OtherKpisService } from '../files';
import { AnalysisAfiDataService } from '../data/analysis.afi.data.service';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import tsMockito from 'ts-mockito';
import { AfiGeneratorService } from './afi.generator.service';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AccountUsersAnalysisUsageFileGenerator', () => {
  let fileGenerator: AfiGeneratorService;
  let naturalForestLostService: NaturalForestLossService;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
        }),
        TypeOrmModule.forFeature([], 'default'),
      ],
      providers: [
        AfiGeneratorService,
        AnalysisAfiDataService,
        NaturalForestLossService,
        OtherKpisService,
        { provide: EmailService, useValue: tsMockito.mock(EmailService) },
        S3Service,
        ConfigService,
      ],
    }).compile();
  });
  beforeEach(async () => {
    naturalForestLostService = await module.resolve<NaturalForestLossService>(
      NaturalForestLossService
    );
    fileGenerator = module.get<AfiGeneratorService>(AfiGeneratorService);
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('makeFile', () => {
    it('should not run make file', async () => {
      const mockFilters = {
        organizationDatabase: 'example-database',
        userEmail: 'user@example.com',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        key: 'example-file.csv',
        file: 'shapefile',
        type: 'afiVC',
      };
      naturalForestLostService.start = jest.fn().mockResolvedValueOnce(true);
      await expect(fileGenerator.makeFile(mockFilters)).rejects.toThrow(Error);
    });

    it('should not run composeResults', async () => {
      const mockFilters = {
        organizationDatabase: 'example-database',
        userEmail: 'user@example.com',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        key: 'example-file.csv',
        file: 'shapefile',
        type: 'afiVC',
      };
      naturalForestLostService.startEmail = jest.fn().mockResolvedValueOnce(true);

      await expect(
        fileGenerator['runAfiFileGeneration']({
          ...mockFilters,
        })
      ).rejects.toThrow(Error);
    });
  });
});
