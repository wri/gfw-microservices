import { AlertsIntegratedNaturalForestService } from './alerts.integrated.natural.forest.service';
import { createDirectory } from '../shared/file.utils';
import * as fs from 'fs';
import { alertsData } from '../shared/mock.data';

describe('Alerts Integrated Natural Forest Service', () => {
  const alertsIntegratedNaturalForestService = new AlertsIntegratedNaturalForestService();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
    type: 'argentinaOverlap',
    selectedTimeframe: 'DAILY',
    selectedAlert: 'Integrated',
    startDate: '2021-01-01',
    endDate: '2021-01-04',
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_IntegratedAlerts_NaturalForest_Daily.csv`;

  const readCsvData = (filePath: string) => {
    const csvData = fs.readFileSync(filePath, 'utf8');
    return csvData.toString().split('\n');
  };

  beforeAll(() => {
    alertsIntegratedNaturalForestService.startEmail = jest.fn();
    alertsIntegratedNaturalForestService.errorEmail = jest.fn();
    alertsIntegratedNaturalForestService.finishedEmail = jest.fn();
    createDirectory(dir);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('Integrated alerts selected timeframe DAY', async () => {
    alertsIntegratedNaturalForestService.start(filters);
    alertsIntegratedNaturalForestService.process(alertsData);

    await alertsIntegratedNaturalForestService.finish(filters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Alert Type,Start Date,End Date,Date,Confidence Level,Total # of alerts,# Alerts in SBTN Natural Forest,# Alerts in JRC Natural Forest,# of locations',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-01,Nominal,2,0,5,1',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-01,High,1,10,10,1',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-01,Highest,4,6,1,1',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-02,Nominal,0,2,0,1',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-02,High,5,6,0,1',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-02,Highest,8,5,2,1',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-03,Nominal,6,2,5,1',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-03,High,0,4,5,1',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-03,Highest,2,8,8,1',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-04,Nominal,9,7,6,1',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-04,High,2,3,7,1',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-04,Highest,8,0,5,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-01,Nominal,2,0,5,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-01,High,1,10,10,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-01,Highest,4,6,1,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-02,Nominal,0,2,0,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-02,High,5,6,0,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-02,Highest,8,5,2,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-03,Nominal,6,2,5,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-03,High,0,4,5,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-03,Highest,2,8,8,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-04,Nominal,9,7,6,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-04,High,2,3,7,1',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-04,Highest,8,0,5,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-01,Nominal,2,0,5,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-01,High,1,10,10,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-01,Highest,4,6,1,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-02,Nominal,0,2,0,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-02,High,5,6,0,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-02,Highest,8,5,2,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-03,Nominal,6,2,5,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-03,High,0,4,5,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-03,Highest,2,8,8,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-04,Nominal,9,7,6,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-04,High,2,3,7,1',
      'WRI,Sargento Cabral,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,2021-01-04,Highest,8,0,5,1',
      'WRI,Total locations,Deforestation (Integrated Alerts),2021-01-01,2021-01-04,,,,,,3',
      '',
    ]);
  });
});
