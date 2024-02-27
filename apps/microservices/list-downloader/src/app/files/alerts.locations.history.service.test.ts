import { describe, expect, test } from '@jest/globals';
import { AlertsLocationsHistoryService } from './alerts.locations.history.service';
import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { alertsData } from '../shared/mock.data';

describe('Alerts Locations History Service', () => {
  const alertsLocationsHistoryService = new AlertsLocationsHistoryService();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
    type: 'argentinaOverlap',
    selectedAlert: 'GLAD',
    startDate: '2021-01-01',
    endDate: '2021-01-31',
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_Alerts_LocationsLevel_Daily.csv`;

  const readCsvData = (filePath: string) => {
    const csvData = fs.readFileSync(filePath, 'utf8');
    return csvData.toString().split('\n');
  };

  beforeAll(() => {
    alertsLocationsHistoryService.startEmail = jest.fn();
    alertsLocationsHistoryService.errorEmail = jest.fn();
    alertsLocationsHistoryService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('GLAD alerts selected timeframe DAY', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'DAY',
    };
    alertsLocationsHistoryService.start(newFilters);
    alertsLocationsHistoryService.process(alertsData);

    await alertsLocationsHistoryService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Alert Type,Start Date,End Date,Date,# of alerts for location',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),01 Jan 2021,31 Jan 2021,02 Jan 2021,638',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),01 Jan 2021,31 Jan 2021,26 Jan 2021,370',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),01 Jan 2021,31 Jan 2021,02 Jan 2021,1',
      '',
    ]);
  }, 50000);

  test('VIIRS alerts selected timeframe DAY', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'DAY',
      startDate: '2023-01-01',
      endDate: '2023-10-31',
      selectedAlert: 'VIIRS',
    };
    alertsLocationsHistoryService.start(newFilters);
    alertsLocationsHistoryService.process(alertsData);

    await alertsLocationsHistoryService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Alert Type,Start Date,End Date,Date,# of alerts for location',
      'WRI,BRA.12.116_1,FIRES (VIIRS),01 Jan 2023,31 Oct 2023,29 Apr 2023,1',
      'WRI,BRA.12.116_1,FIRES (VIIRS),01 Jan 2023,31 Oct 2023,30 Apr 2023,1',
      '',
    ]);
  }, 50000);
});
