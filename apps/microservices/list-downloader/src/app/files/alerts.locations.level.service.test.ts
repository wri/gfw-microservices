import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { alertsData } from '../shared/mock.data';
import { AlertsLocationsLevelService } from './alerts.locations.level.service';

describe('Alerts Locations Level Service', () => {
  const alertsLocationsLevelService = new AlertsLocationsLevelService();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
    type: 'argentinaOverlap',
    selectedTimeframe: 'WEEK',
    selectedAlert: 'GLAD',
    startDate: '2021-01-01',
    endDate: '2021-01-31',
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_Alerts_LocationsLevel.csv`;

  const readCsvData = (filePath) => {
    const csvData = fs.readFileSync(filePath, 'utf8');
    return csvData.toString().split('\n');
  };

  beforeAll(() => {
    alertsLocationsLevelService.startEmail = jest.fn();
    alertsLocationsLevelService.errorEmail = jest.fn();
    alertsLocationsLevelService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('GLAD alerts selected timeframe WEEK', async () => {
    await alertsLocationsLevelService.start(filters);
    alertsLocationsLevelService.process(alertsData);

    await alertsLocationsLevelService.finish(filters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Location Level Alerts (Alerts / 1000 ha)',
      'WRI,BRA.12.116_1,Sinop,Mato Grosso,Brazil,Deforestation (Integrated Alerts),WEEK,2021-01-01,2021-01-31,1008',
      'WRI,Presidencia de la Plaza,Presidencia de la Plaza,Chaco,Argentina,Deforestation (Integrated Alerts),WEEK,2021-01-01,2021-01-31,1',
      'WRI,Sargento Cabral,Sargento Cabral,Chaco,Argentina,Deforestation (Integrated Alerts),WEEK,2021-01-01,2021-01-31,0',
      '',
    ]);
  });

  test('GLAD alerts selected timeframe MONTH', async () => {
    await alertsLocationsLevelService.start({
      ...filters,
      selectedTimeframe: 'MONTH',
    });
    alertsLocationsLevelService.process(alertsData);

    await alertsLocationsLevelService.finish(filters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Location Level Alerts (Alerts / 1000 ha)',
      'WRI,BRA.12.116_1,Sinop,Mato Grosso,Brazil,Deforestation (Integrated Alerts),MONTH,2021-01-01,2021-01-31,1008',
      'WRI,Presidencia de la Plaza,Presidencia de la Plaza,Chaco,Argentina,Deforestation (Integrated Alerts),MONTH,2021-01-01,2021-01-31,1',
      'WRI,Sargento Cabral,Sargento Cabral,Chaco,Argentina,Deforestation (Integrated Alerts),MONTH,2021-01-01,2021-01-31,0',
      '',
    ]);
  });

  test('GLAD alerts selected timeframe YEAR', async () => {
    await alertsLocationsLevelService.start({
      ...filters,
      selectedTimeframe: 'YEAR',
    });
    alertsLocationsLevelService.process(alertsData);

    await alertsLocationsLevelService.finish(filters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Location Level Alerts (Alerts / 1000 ha)',
      'WRI,BRA.12.116_1,Sinop,Mato Grosso,Brazil,Deforestation (Integrated Alerts),YEAR,2021-01-01,2021-01-31,1008',
      'WRI,Presidencia de la Plaza,Presidencia de la Plaza,Chaco,Argentina,Deforestation (Integrated Alerts),YEAR,2021-01-01,2021-01-31,1',
      'WRI,Sargento Cabral,Sargento Cabral,Chaco,Argentina,Deforestation (Integrated Alerts),YEAR,2021-01-01,2021-01-31,0',
      '',
    ]);
  });

  test('VIIRS alerts selected timeframe WEEK', async () => {
    await alertsLocationsLevelService.start({
      ...filters,
      startDate: '2023-04-01',
      endDate: '2023-04-30',
      selectedAlert: 'VIIRS',
    });
    alertsLocationsLevelService.process(alertsData);

    await alertsLocationsLevelService.finish(filters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Location Level Alerts (Alerts / 1000 ha)',
      'WRI,BRA.12.116_1,Sinop,Mato Grosso,Brazil,FIRES (VIIRS),WEEK,2023-04-01,2023-04-30,2',
      'WRI,Presidencia de la Plaza,Presidencia de la Plaza,Chaco,Argentina,FIRES (VIIRS),WEEK,2023-04-01,2023-04-30,0',
      'WRI,Sargento Cabral,Sargento Cabral,Chaco,Argentina,FIRES (VIIRS),WEEK,2023-04-01,2023-04-30,0',
      '',
    ]);
  });
});
