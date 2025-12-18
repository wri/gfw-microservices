import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AlertsGeneratorService } from './alerts.generator.service';
import { AlertsDataService } from '../data/alerts.data.service';
import { AlertsFileService } from '../files/alerts.file.service';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { AlertFieldsFileRequest, AlertsTimeframes } from '@wri-monorepos/sql';

describe('AlertsGeneratorService', () => {
  let service: AlertsGeneratorService;
  let mockAlertsDataService: jest.Mocked<AlertsDataService>;
  let mockAlertsFileService: jest.Mocked<AlertsFileService>;

  beforeEach(async () => {
    mockAlertsDataService = {
      getNumberOfPages: jest.fn(),
      getDataPaginated: jest.fn(),
    } as unknown as jest.Mocked<AlertsDataService>;

    mockAlertsFileService = {
      start: jest.fn(),
      process: jest.fn(),
      finish: jest.fn(),
    } as unknown as jest.Mocked<AlertsFileService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsGeneratorService,
        { provide: AlertsDataService, useValue: mockAlertsDataService },
        { provide: AlertsFileService, useValue: mockAlertsFileService },
        { provide: Logger, useValue: new Logger() },
      ],
    }).compile();

    service = module.get<AlertsGeneratorService>(AlertsGeneratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call all necessary methods in makeFile', async () => {
    const mockFilters: AlertFieldsFileRequest = {
      listId: 123,
      selectedTimeframe: AlertsTimeframes.MONTH,
      selectedAlert: '',
      key: 'example-key',
      listName: 'Alerts_Month',
    };

    mockAlertsDataService.getNumberOfPages.mockResolvedValue(2);
    mockAlertsDataService.getDataPaginated.mockResolvedValue([
      {
        list_id: 0,
        location_id: 0,
        gadm_id: '',
        gladAlerts: '',
        glad_alerts_daily: '',
        glad_alerts_weekly: '',
        glad_alerts_monthly: '',
        viirs_alerts_daily: '',
        tree_cover_extent_total: 0,
        Country: '',
        State: '',
        'Sub State': '',
        totalHa: 0,
        name_all: '',
        gadmid: '',
        gadmid_2: '',
        gadmid_2_lat: 0,
        gadmid_2_lon: 0,
        gadmid_1: '',
        gadmid_1_lat: 0,
        gadmid_1_lon: 0,
        gadmid_0: '',
        gadmid_0_lat: 0,
        gadmid_0_lon: 0,
        location_lat: 0,
        location_lon: 0,
        location_name: '',
      },
    ]);

    await service.makeFile(mockFilters);

    expect(mockAlertsFileService.start).toHaveBeenCalledWith(mockFilters);
    expect(mockAlertsDataService.getNumberOfPages).toHaveBeenCalledWith(mockFilters);
    expect(mockAlertsDataService.getDataPaginated).toHaveBeenCalledTimes(2); // 2 pages
    expect(mockAlertsFileService.process).toHaveBeenCalledTimes(2);
    expect(mockAlertsFileService.finish).toHaveBeenCalledWith(mockFilters);
  });

  it('should log the number of pages during makeFile', async () => {
    const mockFilters: AlertFieldsFileRequest = {
      listId: 123,
      selectedTimeframe: AlertsTimeframes.MONTH,
      selectedAlert: '',
      key: 'example-key',
      listName: 'Alerts_Month',
    };

    mockAlertsDataService.getNumberOfPages.mockResolvedValue(3);
    mockAlertsDataService.getDataPaginated.mockResolvedValue([
      {
        list_id: 0,
        location_id: 0,
        gadm_id: '',
        gladAlerts: '',
        glad_alerts_daily: '',
        glad_alerts_weekly: '',
        glad_alerts_monthly: '',
        viirs_alerts_daily: '',
        tree_cover_extent_total: 0,
        Country: '',
        State: '',
        'Sub State': '',
        totalHa: 0,
        name_all: '',
        gadmid: '',
        gadmid_2: '',
        gadmid_2_lat: 0,
        gadmid_2_lon: 0,
        gadmid_1: '',
        gadmid_1_lat: 0,
        gadmid_1_lon: 0,
        gadmid_0: '',
        gadmid_0_lat: 0,
        gadmid_0_lon: 0,
        location_lat: 0,
        location_lon: 0,
        location_name: '',
      },
    ]);

    const loggerSpy = jest.spyOn(service['logger'], 'log');

    await service.makeFile(mockFilters);

    expect(loggerSpy).toHaveBeenCalledWith('(123) - Number of pages: 3');
    expect(loggerSpy).toHaveBeenCalledWith('(123) - Get page of number 0 from database');
    expect(loggerSpy).toHaveBeenCalledWith('(123) - Get page of number 1 from database');
    expect(loggerSpy).toHaveBeenCalledWith('(123) - Get page of number 2 from database');
  });

  it('should set startDate and endDate if not provided in filters', async () => {
    const mockFilters: AlertFieldsFileRequest = {
      listId: 123,
      selectedTimeframe: AlertsTimeframes.MONTH,
      selectedAlert: '',
      key: 'example-key',
      listName: 'Alerts_Month',
    };

    mockAlertsDataService.getNumberOfPages.mockResolvedValue(1);
    mockAlertsDataService.getDataPaginated.mockResolvedValue([
      {
        list_id: 0,
        location_id: 0,
        gadm_id: '',
        gladAlerts: '',
        glad_alerts_daily: '',
        glad_alerts_weekly: '',
        glad_alerts_monthly: '',
        viirs_alerts_daily: '',
        tree_cover_extent_total: 0,
        Country: '',
        State: '',
        'Sub State': '',
        totalHa: 0,
        name_all: '',
        gadmid: '',
        gadmid_2: '',
        gadmid_2_lat: 0,
        gadmid_2_lon: 0,
        gadmid_1: '',
        gadmid_1_lat: 0,
        gadmid_1_lon: 0,
        gadmid_0: '',
        gadmid_0_lat: 0,
        gadmid_0_lon: 0,
        location_lat: 0,
        location_lon: 0,
        location_name: '',
      },
    ]);

    await service.makeFile(mockFilters);

    const lastMonth = subMonths(new Date(), 1);
    expect(mockFilters.startDate).toEqual(format(startOfMonth(lastMonth), 'yyyy-MM-dd 00:00:00'));
    expect(mockFilters.endDate).toEqual(format(endOfMonth(lastMonth), 'yyyy-MM-dd 23:59:59'));
  });
});
