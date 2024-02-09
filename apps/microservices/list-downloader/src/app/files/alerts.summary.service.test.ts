import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { alertsData } from '../shared/mock.data';
import { AlertsSummaryService } from './alerts.summary.service';

describe('Alerts Summary Service', () => {
  const alertsSummaryService = new AlertsSummaryService();

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
  const filePath = `${dir}/${filters.listName}_AlertsSummary.csv`;

  const readCsvData = (filePath: string) => {
    const csvData = fs.readFileSync(filePath, 'utf8');
    return csvData.toString().split('\n');
  };

  beforeAll(() => {
    alertsSummaryService.startEmail = jest.fn();
    alertsSummaryService.errorEmail = jest.fn();
    alertsSummaryService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('GLAD alerts selected timeframe WEEK', async () => {
    alertsSummaryService.start(filters);
    alertsSummaryService.process(alertsData);

    await alertsSummaryService.finish(filters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List(s),Alert Type,Timeframe,Total Locations with alerts data,Total Locations,Locations with Alerts,Percentage Locations with Alerts of All Locations,Number of Alerts',
      'WRI,Deforestation (Integrated Alerts),WEEK,3,1,1,100,1182',
      '',
    ]);
  });

  test('GLAD alerts selected timeframe MONTH', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'MONTH',
    };

    alertsSummaryService.start(newFilters);
    alertsSummaryService.process(alertsData);

    await alertsSummaryService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List(s),Alert Type,Timeframe,Total Locations with alerts data,Total Locations,Locations with Alerts,Percentage Locations with Alerts of All Locations,Number of Alerts',
      'WRI,Deforestation (Integrated Alerts),MONTH,3,1,1,100,1182',
      '',
    ]);
  });

  test('GLAD alerts selected timeframe YEAR', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'YEAR',
    };

    alertsSummaryService.start(newFilters);
    alertsSummaryService.process(alertsData);

    await alertsSummaryService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List(s),Alert Type,Timeframe,Total Locations with alerts data,Total Locations,Locations with Alerts,Percentage Locations with Alerts of All Locations,Number of Alerts',
      'WRI,Deforestation (Integrated Alerts),YEAR,3,1,1,100,1182',
      '',
    ]);
  });

  test('VIIRS alerts selected timeframe WEEK', async () => {
    const newFilters = {
      ...filters,
      startDate: '2023-04-01',
      endDate: '2023-04-30',
      selectedAlert: 'VIIRS',
    };

    alertsSummaryService.start(newFilters);
    alertsSummaryService.process(alertsData);

    await alertsSummaryService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List(s),Alert Type,Timeframe,Total Locations with alerts data,Total Locations,Locations with Alerts,Percentage Locations with Alerts of All Locations,Number of Alerts',
      'WRI,FIRES (VIIRS),WEEK,3,1,1,100,56',
      '',
    ]);
  });
});
