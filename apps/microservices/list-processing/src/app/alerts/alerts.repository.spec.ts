import { Test, TestingModule } from '@nestjs/testing';
import { AlertsRepository } from './alerts.repository';
import { ConfigService } from '@nestjs/config';
import { DashboardDataType, CountDashboardDataType } from '@wri-monorepos/sql';

describe('AlertsRepository', () => {
  let repository: AlertsRepository;
  let configService: jest.Mocked<ConfigService>;

  const mockDashboardData: DashboardDataType[] = [
    {
      list_id: 1,
      location_id: 1,
      gadm_id: '123',
      gladAlerts: 'true',
      glad_alerts_daily: '[]',
      glad_alerts_weekly: '[]',
      glad_alerts_monthly: '[]',
      viirs_alerts_daily: '[]',
      tree_cover_extent_total: 100,
      Country: 'Test Country',
      State: 'Test State',
      'Sub State': 'Test Sub State',
      totalHa: 1000,
      name_all: 'Test Location',
      gadmid: '123',
      gadmid_2: '123',
      gadmid_2_lat: 0,
      gadmid_2_lon: 0,
      gadmid_1: '123',
      gadmid_1_lat: 0,
      gadmid_1_lon: 0,
      gadmid_0: '123',
      gadmid_0_lat: 0,
      gadmid_0_lon: 0,
      location_lat: 0,
      location_lon: 0,
      location_name: 'Test Location',
    },
  ];

  const mockCountData: CountDashboardDataType = {
    quantity: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsRepository,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<AlertsRepository>(AlertsRepository);
    configService = module.get(ConfigService);
  });

  describe('countDashboardData', () => {
    it('should return count of dashboard data for a given list ID', async () => {
      const listId = 1;
      const clientDatabase = 'test-db';

      jest
        .spyOn(repository as AlertsRepository, 'countDashboardData')
        .mockResolvedValue(mockCountData);

      const result = await repository.countDashboardData(listId, clientDatabase);

      expect(result).toEqual(mockCountData);
    });
  });

  describe('findDashboardDataByListIdPaginated', () => {
    it('should return paginated dashboard data', async () => {
      const listId = 1;
      const clientDatabase = 'test-db';
      const pageNumber = 1;
      const rowsPerPage = 10;

      jest
        .spyOn(repository as AlertsRepository, 'findDashboardDataByListIdPaginated')
        .mockResolvedValue(mockDashboardData);

      const result = await repository.findDashboardDataByListIdPaginated(
        listId,
        clientDatabase,
        pageNumber,
        rowsPerPage
      );

      expect(result).toEqual(mockDashboardData);
    });
  });

  describe('countGFWDashboardData', () => {
    it('should return count of GFW dashboard data', async () => {
      const listId = 1;
      configService.get.mockReturnValue('gfw-db');

      jest
        .spyOn(repository as AlertsRepository, 'countGFWDashboardData')
        .mockResolvedValue(mockCountData);

      const result = await repository.countGFWDashboardData(listId);

      expect(result).toEqual(mockCountData);
    });
  });

  describe('findGFWDashboardDataByListIdPaginated', () => {
    it('should return paginated GFW dashboard data', async () => {
      const listId = 1;
      const pageNumber = 1;
      const rowsPerPage = 10;
      configService.get.mockReturnValue('gfw-db');

      jest
        .spyOn(repository as AlertsRepository, 'findGFWDashboardDataByListIdPaginated')
        .mockResolvedValue(mockDashboardData);

      const result = await repository.findGFWDashboardDataByListIdPaginated(
        listId,
        pageNumber,
        rowsPerPage
      );

      expect(result).toEqual(mockDashboardData);
    });
  });
});
