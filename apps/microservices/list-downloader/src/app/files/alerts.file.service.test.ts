import { AlertsFileService } from './alerts.file.service';
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
  let alertsGlobalIntegratedDisturbanceDailyService: AlertsGlobalIntegratedDisturbanceDailyService;
  let clientStoreConnection: ClientStoreConnection;

  beforeEach(() => {
    mockedGetAllFilesAndZip.mockReset();
    mockedGetAllFilesAndZip.mockResolvedValue('ok');

    clientStoreConnection = new ClientStoreConnection();
    alertsGlobalIntegratedDisturbanceDailyService =
      new AlertsGlobalIntegratedDisturbanceDailyService(new ClientStoreConnection());

    service = new AlertsFileService(
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
        .spyOn(alertsGlobalIntegratedDisturbanceDailyService, 'start')
        .mockImplementation(() => Promise.resolve());

      await service.start(filters);

      expect(alertsGlobalIntegratedDisturbanceDailyService.start).toHaveBeenCalledWith(filters);
    });
  });

  describe('process', () => {
    beforeEach(() => {
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
        .spyOn(alertsGlobalIntegratedDisturbanceDailyService, 'process')
        .mockImplementation(() => Promise.resolve());

      await service.start(filters);
      service.process(analysisData, filters);

      expect(alertsGlobalIntegratedDisturbanceDailyService.process).toHaveBeenCalledWith(
        analysisData
      );
    });
  });

  describe('finish', () => {
    it('should call integrated alert services and zip files', async () => {
      const filters = {
        selectedTimeframe: AlertsTimeframes.DAY,
        key: 'test-key',
        organizationDatabase: 'orgDb',
        listName: 'IntegratedAlerts_NaturalForest_Daily',
      } as AlertFieldsFileRequest;

      jest
        .spyOn(alertsGlobalIntegratedDisturbanceDailyService, 'start')
        .mockImplementation(() => undefined);
      jest
        .spyOn(alertsGlobalIntegratedDisturbanceDailyService, 'finish')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(service, 'finishProcess').mockImplementation(() => Promise.resolve());

      await service.start(filters);
      await service.finish(filters);

      expect(alertsGlobalIntegratedDisturbanceDailyService.finish).toHaveBeenCalledWith(filters);
      expect(getAllFilesAndZip).toHaveBeenCalledWith(filters);
      expect(service.finishProcess).toHaveBeenCalledWith(filters);
    });
  });
});
