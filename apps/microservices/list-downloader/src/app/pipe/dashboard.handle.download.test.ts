import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { NaturalForestLossService, OtherKpisService } from '../files';
import { AnalysisAfiDataService } from '../data/analysis.afi.data.service';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import tsMockito from 'ts-mockito';
import { DashboardHandleDownload } from './dashboard.handle.download';

describe('AccountUsersAnalysisUsageFileGenerator', () => {
  let fileGenerator: DashboardHandleDownload;
  const mockNaturalForestLossService = {
    startEmail: jest.fn().mockResolvedValue('mocked result'),
    finishProcess: jest.fn().mockResolvedValue('mocked result'),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      providers: [
        DashboardHandleDownload,
        AnalysisAfiDataService,
        {
          provide: NaturalForestLossService,
          useValue: mockNaturalForestLossService,
        },
        OtherKpisService,
        { provide: EmailService, useValue: tsMockito.mock(EmailService) },
        S3Service,
      ],
    }).compile();

    fileGenerator = module.get<DashboardHandleDownload>(DashboardHandleDownload);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('start', () => {
    it('should start process', async () => {
      const mockFilters = {
        organizationDatabase: 'example-database',
        userEmail: 'user@example.com',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        key: 'example-file.csv',
        file: 'shapefile',
        type: 'afiVC',
      };
      await expect(fileGenerator.start(mockFilters, 'mock_table', 'mock-sulfix')).rejects.toThrow(
        Error
      );
    });
  });
});
