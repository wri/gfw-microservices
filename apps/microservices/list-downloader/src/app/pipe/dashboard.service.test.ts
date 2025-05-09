import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ArgentinaDeforestationService,
  ArgentinaOverlapService,
  CommodityRiskDiagnosticLocationSummaryService,
  DeforestationTrendsService,
  ForestChangeDiagnosticListSummaryService,
  ForestChangeDiagnosticLocationSummaryService,
  ForestLossService,
  HistoricPercentService,
  MillPriorityService,
  PalmRiskAnalysisService,
  SouthAmericaBiomesService,
  SouthAmericaLossService,
  SouthEastAsiaOverlapService,
  SouthEastAsiaTCLService,
  ColombiaOverlapService,
  ColombiaDeforestationService,
} from '../files';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import tsMockito from 'ts-mockito';

jest.mock('../shared/file.utils', () => ({
  getAllFilesAndZip: jest.fn(),
}));

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let forestLossService: jest.Mocked<ForestLossService>;
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
        DashboardService,
        {
          provide: ForestLossService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: HistoricPercentService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: ForestChangeDiagnosticLocationSummaryService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: ForestChangeDiagnosticListSummaryService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: CommodityRiskDiagnosticLocationSummaryService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: DeforestationTrendsService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: MillPriorityService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: PalmRiskAnalysisService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: SouthAmericaBiomesService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: SouthAmericaLossService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: SouthEastAsiaOverlapService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: SouthEastAsiaTCLService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: ArgentinaOverlapService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: ArgentinaDeforestationService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: ColombiaOverlapService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        {
          provide: ColombiaDeforestationService,
          useValue: { start: jest.fn(), process: jest.fn(), finish: jest.fn() },
        },
        ConfigService,
        { provide: EmailService, useValue: tsMockito.mock(EmailService) },
        S3Service,
      ],
    }).compile();
  });

  beforeEach(async () => {
    forestLossService = module.get<ForestLossService>(
      ForestLossService
    ) as jest.Mocked<ForestLossService>;
    dashboardService = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('start', () => {
    it('should call start on all dependent services', async () => {
      const mockFilters = {
        listId: 123,
        key: 'example-key',
        listName: 'example-list',
      } as any;

      await dashboardService.start(mockFilters);

      expect(forestLossService.start).toHaveBeenCalledWith(mockFilters);
      expect(forestLossService.start).toHaveBeenCalledTimes(1);
    });
  });

  describe('process', () => {
    it('should call process on all dependent services', async () => {
      const mockFilters = {
        listId: 123,
        key: 'example-key',
        listName: 'example-list',
      } as any;
      const mockData = [{ field1: 'value1' }];

      await dashboardService.process(mockData, mockFilters);

      expect(forestLossService.process).toHaveBeenCalledWith(mockData, mockFilters);
      expect(forestLossService.process).toHaveBeenCalledTimes(1);
    });
  });
});
