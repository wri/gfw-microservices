import { Test, TestingModule } from '@nestjs/testing';
import { AlertsRepository } from './alerts.repository';
import { ClientStoreConnection } from '@wri-monorepos/sql';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GFWList } from '@wri-monorepos/sql';
import { Repository } from 'typeorm';
import { DashboardDataType, CountDashboardDataType } from '@wri-monorepos/sql';

describe('AlertsRepository', () => {
  let repository: AlertsRepository;
  let configService: jest.Mocked<ConfigService>;
  let gfwListRepository: jest.Mocked<Repository<GFWList>>;

  const mockGFWList: Partial<GFWList> = {
    id: 1,
    listName: 'Test List',
    listTableName: 'test_table',
    listAnalysisTableName: 'test_analysis',
    listStatusId: 1,
    dashboardLastResults: new Date(),
    dashboardLastSubmit: new Date(),
  };

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
          provide: ClientStoreConnection,
          useValue: {
            getConnection: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GFWList, 'default'),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<AlertsRepository>(AlertsRepository);
    configService = module.get(ConfigService);
    gfwListRepository = module.get(getRepositoryToken(GFWList, 'default'));
  });

  describe('findDashboardDataByListId', () => {
    it('should return dashboard data for a given list ID', async () => {
      const listId = 1;
      const clientDatabase = 'test-db';

      jest
        .spyOn(repository as AlertsRepository, 'findDashboardDataByListId')
        .mockResolvedValue(mockDashboardData);

      const result = await repository.findDashboardDataByListId(listId, clientDatabase);

      expect(result).toEqual(mockDashboardData);
    });
  });

  describe('findGFWListDashboardDataByListId', () => {
    it('should return GFW list dashboard data for a given list ID', async () => {
      const listId = 1;
      configService.get.mockReturnValue('gfw-db');

      jest
        .spyOn(repository as AlertsRepository, 'findGFWListDashboardDataByListId')
        .mockResolvedValue(mockDashboardData);

      const result = await repository.findGFWListDashboardDataByListId(listId);

      expect(result).toEqual(mockDashboardData);
    });
  });

  describe('findGFWListDashboardTimestampByListId', () => {
    it('should return dashboard timestamps for a GFW list', async () => {
      const listId = 1;
      gfwListRepository.findOne.mockResolvedValue(mockGFWList as GFWList);

      const result = await repository.findGFWListDashboardTimestampByListId(listId);

      expect(result).toEqual({
        dashboardLastResults: mockGFWList.dashboardLastResults,
        dashboardLastSubmit: mockGFWList.dashboardLastSubmit,
      });
    });
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

  describe('findDashboardTimestampByListId', () => {
    it('should return dashboard timestamps for a client list', async () => {
      const listId = 1;
      const clientDatabase = 'test-db';
      const mockList = {
        dashboardLastResults: new Date(),
        dashboardLastSubmit: new Date(),
      };

      const mockConnection = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockList),
        }),
      };

      jest
        .spyOn(repository as any, 'createOrganizationConnection')
        .mockResolvedValue(mockConnection);

      const result = await repository.findDashboardTimestampByListId(listId, clientDatabase);

      expect(result).toEqual({
        dashboardLastResults: mockList.dashboardLastResults,
        dashboardLastSubmit: mockList.dashboardLastSubmit,
      });
      expect(repository['createOrganizationConnection']).toHaveBeenCalledWith(clientDatabase);
    });
  });
});
