import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { alertsData } from '../shared/mock.data';
import { AlertsHistoryService } from './alerts.history.service';

describe('Alerts History Service', () => {
  const alertsHistoryService = new AlertsHistoryService();

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
  const filePath = `${dir}/${filters.listName}_AlertsHistory.csv`;

  const readCsvData = (filePath) => {
    const csvData = fs.readFileSync(filePath, 'utf8');
    return csvData.toString().split('\n');
  };

  beforeAll(() => {
    alertsHistoryService.startEmail = jest.fn();
    alertsHistoryService.errorEmail = jest.fn();
    alertsHistoryService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('GLAD alerts selected timeframe WEEK', async () => {
    alertsHistoryService.start(filters);
    alertsHistoryService.process(alertsData);

    await alertsHistoryService.finish(filters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Alert Type,Timeframe,Number of Alerts,Start Date,End Date',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,01 Jan 2021,01 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,1,02 Jan 2021,02 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,03 Jan 2021,03 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,04 Jan 2021,04 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,05 Jan 2021,05 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,06 Jan 2021,06 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,07 Jan 2021,07 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,08 Jan 2021,08 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,09 Jan 2021,09 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,10 Jan 2021,10 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,11 Jan 2021,11 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,676,12 Jan 2021,12 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,13 Jan 2021,13 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,14 Jan 2021,14 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,15 Jan 2021,15 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,16 Jan 2021,16 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,17 Jan 2021,17 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,18 Jan 2021,18 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,19 Jan 2021,19 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,8,20 Jan 2021,20 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,21 Jan 2021,21 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,22 Jan 2021,22 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,23 Jan 2021,23 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,24 Jan 2021,24 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,1,25 Jan 2021,25 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,26 Jan 2021,26 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,27 Jan 2021,27 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,496,28 Jan 2021,28 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,29 Jan 2021,29 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,30 Jan 2021,30 Jan 2021',
      'WRI,Deforestation (Integrated Alerts),WEEK,0,31 Jan 2021,31 Jan 2021',
    ]);
  });

  test('GLAD alerts selected timeframe MONTH', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'MONTH',
    };

    alertsHistoryService.start(newFilters);
    alertsHistoryService.process(alertsData);

    await alertsHistoryService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Alert Type,Timeframe,Number of Alerts,Start Date,End Date',
      'WRI,Deforestation (Integrated Alerts),MONTH,1182,01 Jan 2021,31 Jan 2021',
    ]);
  });

  test('GLAD alerts selected timeframe YEAR', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'YEAR',
    };

    alertsHistoryService.start(newFilters);
    alertsHistoryService.process(alertsData);

    await alertsHistoryService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Alert Type,Timeframe,Number of Alerts,Start Date,End Date',
      'WRI,Deforestation (Integrated Alerts),YEAR,1182,01 Jan 2021,31 Jan 2021',
    ]);
  });

  test('VIIRS alerts selected timeframe WEEK', async () => {
    const newFilters = {
      ...filters,
      startDate: '2023-04-01',
      endDate: '2023-04-30',
      selectedAlert: 'VIIRS',
    };

    alertsHistoryService.start(newFilters);
    alertsHistoryService.process(alertsData);

    await alertsHistoryService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Alert Type,Timeframe,Number of Alerts,Start Date,End Date',
      'WRI,FIRES (VIIRS),WEEK,0,01 Apr 2023,01 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,3,02 Apr 2023,02 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,03 Apr 2023,03 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,04 Apr 2023,04 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,05 Apr 2023,05 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,06 Apr 2023,06 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,07 Apr 2023,07 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,08 Apr 2023,08 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,09 Apr 2023,09 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,10 Apr 2023,10 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,11 Apr 2023,11 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,12 Apr 2023,12 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,13 Apr 2023,13 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,14 Apr 2023,14 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,15 Apr 2023,15 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,4,16 Apr 2023,16 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,1,17 Apr 2023,17 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,18 Apr 2023,18 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,2,19 Apr 2023,19 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,20 Apr 2023,20 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,2,21 Apr 2023,21 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,3,22 Apr 2023,22 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,23 Apr 2023,23 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,24 Apr 2023,24 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,4,25 Apr 2023,25 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,0,26 Apr 2023,26 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,2,27 Apr 2023,27 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,14,28 Apr 2023,28 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,15,29 Apr 2023,29 Apr 2023',
      'WRI,FIRES (VIIRS),WEEK,6,30 Apr 2023,30 Apr 2023',
    ]);
  });
});
