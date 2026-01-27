import * as fs from 'fs';

import { AlertsGlobalIntegratedDisturbanceDailyService } from './alerts.global.integrated.disturbance.daily.service';
import { createDirectory } from '../shared/file.utils';
import { AlertsTimeframes, ClientStoreConnection, DashboardDataType } from '@wri-monorepos/sql';
import { DataSource } from 'typeorm';

describe('AlertsGlobalIntegratedDisturbanceDailyService', () => {
  const clientStoreConnection = new ClientStoreConnection();
  const service = new AlertsGlobalIntegratedDisturbanceDailyService(clientStoreConnection);

  const filters = {
    listId: 99,
    listName: 'TestList',
    key: 'tmp-global-disturbance',
    selectedTimeframe: AlertsTimeframes.DAY,
    selectedAlert: 'Integrated',
    startDate: '2021-01-01',
    endDate: '2021-01-02',
    organizationDatabase: 'test-db',
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_Global_Integrated_Disturbance_Alerts_Daily.csv`;

  const readCsvLines = () => fs.readFileSync(filePath, 'utf8').toString().split('\n');

  beforeAll(() => {
    service.startEmail = jest.fn();
    service.finishedEmail = jest.fn();
    service.errorEmail = jest.fn();
    createDirectory(dir);
  });

  afterEach(() => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  afterAll(() => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should generate the Global Integrated Disturbance Alerts Daily CSV with hectares from area columns and totals', async () => {
    const mockConnection: Partial<DataSource> = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ totalHaSum: 500 }),
        }),
      }),
    };

    jest
      .spyOn(clientStoreConnection, 'getConnection')
      .mockResolvedValue(mockConnection as DataSource);

    const sampleData = [
      {
        list_id: 1,
        location_id: 10,
        location_name: 'Location A',
        totalHa: 200,
        Country: 'CountryX',
        State: 'StateY',
        'Sub State': 'SubZ',
        integratedAlertsAreaAllNominal: '{"2021-01-01":"0.18","2021-01-02":"0.09"}',
        integratedAlertsAreaSbtnNaturalForestsNominal: '{"2021-01-01":"0.09","2021-01-02":"0"}',
        integratedAlertsAreaSbtnNaturalEcosystemNominal: '{"2021-01-01":"0","2021-01-02":"0"}',
        integratedAlertsAreaJrcNominal: '{"2021-01-01":"0","2021-01-02":"0.09"}',
        integratedAlertsAreaAllHigh: '{"2021-01-02":"0.27"}',
        integratedAlertsAreaSbtnNaturalForestsHigh: '{"2021-01-02":"0.18"}',
        integratedAlertsAreaSbtnNaturalEcosystemHigh: '{"2021-01-02":"0"}',
        integratedAlertsAreaJrcHigh: '{"2021-01-02":"0.09"}',
        integratedAlertsAreaAllHighest: '{"2021-01-01":"0.36"}',
        integratedAlertsAreaSbtnNaturalForestsHighest: '{"2021-01-01":"0.18"}',
        integratedAlertsAreaSbtnNaturalEcosystemHighest: '{"2021-01-01":"0"}',
        integratedAlertsAreaJrcHighest: '{"2021-01-01":"0.09"}',
      },
    ];

    service.start(filters);
    service.process(sampleData as unknown as DashboardDataType[]);

    await service.finish(filters);

    const csvData = readCsvLines();
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Location Size (ha),Country,State,Sub state,Alert Type,Start Date,End Date,Date,Confidence Level,Total alert hectares,Hectares of alerts in SBTN Natural Forest,Hectares of alerts in SBTN Natural Open Ecosystems,Hectares of alerts in JRC Forest,Number of locations',
      'TestList_Global_Integrated_Disturbance_Alerts_Daily,"Location A",200,CountryX,StateY,SubZ,"Global Integrated Disturbance Alert",2021-01-01,2021-01-02,2021-01-01,Nominal,0.18,0.09,0,0,1',
      'TestList_Global_Integrated_Disturbance_Alerts_Daily,"Location A",200,CountryX,StateY,SubZ,"Global Integrated Disturbance Alert",2021-01-01,2021-01-02,2021-01-01,Highest,0.36,0.18,0,0.09,1',
      'TestList_Global_Integrated_Disturbance_Alerts_Daily,"Location A",200,CountryX,StateY,SubZ,"Global Integrated Disturbance Alert",2021-01-01,2021-01-02,2021-01-02,Nominal,0.09,0,0,0.09,1',
      'TestList_Global_Integrated_Disturbance_Alerts_Daily,"Location A",200,CountryX,StateY,SubZ,"Global Integrated Disturbance Alert",2021-01-01,2021-01-02,2021-01-02,High,0.27,0.18,0,0.09,1',
      'TestList_Global_Integrated_Disturbance_Alerts_Daily,Total locations,500,,,,Global Integrated Disturbance Alert,2021-01-01,2021-01-02,,,,,,,1',
      '',
    ]);
  });
});
