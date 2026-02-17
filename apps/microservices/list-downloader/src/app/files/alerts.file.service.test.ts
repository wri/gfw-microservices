import { AlertsFileService } from './alerts.file.service';
import { AlertsAdminAreasLevelService } from './alerts.admin.areas.level.service';
import { AlertsHistoryService } from './alerts.history.service';
import { AlertsLocationsLevelService } from './alerts.locations.level.service';
import { AlertsPrioritiesAdminAreasLevelService } from './alerts.priorities.admin.areas.level.service';
import { AlertsPrioritiesLocationsLevelService } from './alerts.priorities.locations.level.service';
import { AlertsSummaryService } from './alerts.summary.service';
import { AlertsIntegratedNaturalForestService } from './alerts.integrated.natural.forest.service';
import { AlertsGlobalIntegratedDisturbanceDailyService } from './alerts.global.integrated.disturbance.daily.service';
import { getAllFilesAndZip } from '../shared/file.utils';
import {
  AlertFieldsFileRequest,
  AlertsTimeframes,
  ClientStoreConnection,
  DashboardDataType,
} from '@wri-monorepos/sql';

jest.mock('../shared/file.utils');

const mockedGetAllFilesAndZip = getAllFilesAndZip as jest.MockedFunction<typeof getAllFilesAndZip>;

describe('AlertsFileService', () => {
  let service: AlertsFileService;
  let alertsAdminAreasLevelService: AlertsAdminAreasLevelService;
  let alertsHistoryService: AlertsHistoryService;
  let alertsLocationsLevelService: AlertsLocationsLevelService;
  let alertsPrioritiesAdminAreasLevelService: AlertsPrioritiesAdminAreasLevelService;
  let alertsPrioritiesLocationsLevelService: AlertsPrioritiesLocationsLevelService;
  let alertsSummaryService: AlertsSummaryService;
  let alertsIntegratedNaturalForestService: AlertsIntegratedNaturalForestService;
  let alertsGlobalIntegratedDisturbanceDailyService: AlertsGlobalIntegratedDisturbanceDailyService;
  let clientStoreConnection: ClientStoreConnection;

  beforeEach(() => {
    mockedGetAllFilesAndZip.mockReset();
    mockedGetAllFilesAndZip.mockResolvedValue('ok');

    alertsAdminAreasLevelService = new AlertsAdminAreasLevelService();
    alertsHistoryService = new AlertsHistoryService();
    alertsLocationsLevelService = new AlertsLocationsLevelService();
    alertsPrioritiesAdminAreasLevelService = new AlertsPrioritiesAdminAreasLevelService();
    alertsPrioritiesLocationsLevelService = new AlertsPrioritiesLocationsLevelService();
    alertsSummaryService = new AlertsSummaryService();
    clientStoreConnection = new ClientStoreConnection();
    alertsIntegratedNaturalForestService = new AlertsIntegratedNaturalForestService(
      clientStoreConnection
    );
    alertsGlobalIntegratedDisturbanceDailyService =
      new AlertsGlobalIntegratedDisturbanceDailyService(new ClientStoreConnection());

    service = new AlertsFileService(
      alertsAdminAreasLevelService,
      alertsHistoryService,
      alertsLocationsLevelService,
      alertsPrioritiesAdminAreasLevelService,
      alertsPrioritiesLocationsLevelService,
      alertsSummaryService,
      alertsIntegratedNaturalForestService,
      alertsGlobalIntegratedDisturbanceDailyService,
      clientStoreConnection
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('start', () => {
    it('should call integrated alert services for DAY timeframe', async () => {
      const filters = {
        selectedTimeframe: AlertsTimeframes.DAY,
        organizationDatabase: 'orgDb',
        listName: 'IntegratedAlerts_NaturalForest_Daily',
      } as AlertFieldsFileRequest;

      jest
        .spyOn(alertsIntegratedNaturalForestService, 'start')
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(alertsGlobalIntegratedDisturbanceDailyService, 'start')
        .mockImplementation(() => Promise.resolve());

      await service.start(filters);

      expect(alertsIntegratedNaturalForestService.start).toHaveBeenCalledWith(filters);
      expect(alertsGlobalIntegratedDisturbanceDailyService.start).toHaveBeenCalledWith(filters);
    });

    it('should call the appropriate services for non-DAY timeframe', async () => {
      const filters = {
        selectedTimeframe: AlertsTimeframes.MONTH,
        listName: 'Alerts_Month',
      } as AlertFieldsFileRequest;

      jest.spyOn(alertsLocationsLevelService, 'start').mockImplementation(() => Promise.resolve());
      jest
        .spyOn(alertsPrioritiesLocationsLevelService, 'start')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(alertsAdminAreasLevelService, 'start').mockImplementation(() => Promise.resolve());
      jest.spyOn(alertsHistoryService, 'start').mockImplementation(() => Promise.resolve());
      jest
        .spyOn(alertsPrioritiesAdminAreasLevelService, 'start')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(alertsSummaryService, 'start').mockImplementation(() => Promise.resolve());

      await service.start(filters);

      expect(alertsLocationsLevelService.start).toHaveBeenCalledWith(filters);
      expect(alertsPrioritiesLocationsLevelService.start).toHaveBeenCalledWith(filters);
      expect(alertsAdminAreasLevelService.start).toHaveBeenCalledWith(filters);
      expect(alertsHistoryService.start).toHaveBeenCalledWith(filters);
      expect(alertsPrioritiesAdminAreasLevelService.start).toHaveBeenCalledWith(filters);
      expect(alertsSummaryService.start).toHaveBeenCalledWith(filters);
    });
  });

  describe('process', () => {
    beforeEach(() => {
      jest.spyOn(alertsIntegratedNaturalForestService, 'start').mockImplementation(() => undefined);
      jest
        .spyOn(alertsGlobalIntegratedDisturbanceDailyService, 'start')
        .mockImplementation(() => undefined);
    });

    it('should call integrated alert services for DAY timeframe', async () => {
      const filters = {
        selectedTimeframe: AlertsTimeframes.DAY,
        organizationDatabase: 'orgDb',
        key: 'test-key',
        listName: 'IntegratedAlerts_NaturalForest_Daily',
      } as AlertFieldsFileRequest;
      const analysisData = [] as DashboardDataType[];

      jest
        .spyOn(alertsIntegratedNaturalForestService, 'process')
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(alertsGlobalIntegratedDisturbanceDailyService, 'process')
        .mockImplementation(() => Promise.resolve());

      await service.start(filters);
      service.process(analysisData, filters);

      expect(alertsIntegratedNaturalForestService.process).toHaveBeenCalledWith(analysisData);
      expect(alertsGlobalIntegratedDisturbanceDailyService.process).toHaveBeenCalledWith(
        analysisData
      );
    });

    it('should call the appropriate services for non-DAY timeframe', () => {
      const filters = { selectedTimeframe: AlertsTimeframes.MONTH } as AlertFieldsFileRequest;
      const analysisData = [] as DashboardDataType[];

      jest
        .spyOn(alertsLocationsLevelService, 'process')
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(alertsAdminAreasLevelService, 'process')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(alertsHistoryService, 'process').mockImplementation(() => Promise.resolve());
      jest
        .spyOn(alertsPrioritiesAdminAreasLevelService, 'process')
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(alertsPrioritiesLocationsLevelService, 'process')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(alertsSummaryService, 'process').mockImplementation(() => Promise.resolve());

      service.process(analysisData, filters);

      expect(alertsLocationsLevelService.process).toHaveBeenCalledWith(analysisData);
      expect(alertsAdminAreasLevelService.process).toHaveBeenCalledWith(analysisData);
      expect(alertsHistoryService.process).toHaveBeenCalledWith(analysisData);
      expect(alertsPrioritiesAdminAreasLevelService.process).toHaveBeenCalledWith(analysisData);
      expect(alertsPrioritiesLocationsLevelService.process).toHaveBeenCalledWith(analysisData);
      expect(alertsSummaryService.process).toHaveBeenCalledWith(analysisData);
    });
  });

  describe('finish', () => {
    it('should call integrated alert services for DAY timeframe and zip files', async () => {
      const filters = {
        selectedTimeframe: AlertsTimeframes.DAY,
        key: 'test-key',
        organizationDatabase: 'orgDb',
        listName: 'IntegratedAlerts_NaturalForest_Daily',
      } as AlertFieldsFileRequest;

      jest.spyOn(alertsIntegratedNaturalForestService, 'start').mockImplementation(() => undefined);
      jest
        .spyOn(alertsGlobalIntegratedDisturbanceDailyService, 'start')
        .mockImplementation(() => undefined);
      jest
        .spyOn(alertsIntegratedNaturalForestService, 'finish')
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(alertsGlobalIntegratedDisturbanceDailyService, 'finish')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(service, 'finishProcess').mockImplementation(() => Promise.resolve());

      await service.start(filters);
      await service.finish(filters);

      expect(alertsIntegratedNaturalForestService.finish).toHaveBeenCalledWith(filters);
      expect(alertsGlobalIntegratedDisturbanceDailyService.finish).toHaveBeenCalledWith(filters);
      expect(getAllFilesAndZip).toHaveBeenCalledWith(filters);
      expect(service.finishProcess).toHaveBeenCalledWith(filters);
    });

    it('should call the appropriate services for non-DAY timeframe and zip files', async () => {
      const filters = {
        selectedTimeframe: AlertsTimeframes.MONTH,
        key: 'test-key',
        listName: 'Alerts_Month',
      } as AlertFieldsFileRequest;

      jest.spyOn(alertsLocationsLevelService, 'finish').mockImplementation(() => Promise.resolve());
      jest
        .spyOn(alertsAdminAreasLevelService, 'finish')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(alertsHistoryService, 'finish').mockImplementation(() => Promise.resolve());
      jest
        .spyOn(alertsPrioritiesAdminAreasLevelService, 'finish')
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(alertsPrioritiesLocationsLevelService, 'finish')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(alertsSummaryService, 'finish').mockImplementation(() => Promise.resolve());
      jest.spyOn(service, 'finishProcess').mockImplementation(() => Promise.resolve());

      await service.finish(filters);

      expect(alertsLocationsLevelService.finish).toHaveBeenCalledWith(filters);
      expect(alertsAdminAreasLevelService.finish).toHaveBeenCalledWith(filters);
      expect(alertsHistoryService.finish).toHaveBeenCalledWith(filters);
      expect(alertsPrioritiesAdminAreasLevelService.finish).toHaveBeenCalledWith(filters);
      expect(alertsPrioritiesLocationsLevelService.finish).toHaveBeenCalledWith(filters);
      expect(alertsSummaryService.finish).toHaveBeenCalledWith(filters);
      expect(getAllFilesAndZip).toHaveBeenCalledWith(filters);
      expect(service.finishProcess).toHaveBeenCalledWith(filters);
    });
  });
});
