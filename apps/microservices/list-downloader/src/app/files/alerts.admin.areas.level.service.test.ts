import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { alertsData } from '../shared/mock.data';
import { AlertsAdminAreasLevelService } from './alerts.admin.areas.level.service';

describe('Alerts Admin Areas Level Service', () => {
  const alertsAdminAreasLevelService = new AlertsAdminAreasLevelService();

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
  const filePath = `${dir}/${filters.listName}_Alerts_AdminAreasLevel.csv`;

  const readCsvData = (filePath: string) => {
    const csvData = fs.readFileSync(filePath, 'utf8');
    return csvData.toString().split('\n');
  };

  beforeAll(() => {
    alertsAdminAreasLevelService.startEmail = jest.fn();
    alertsAdminAreasLevelService.errorEmail = jest.fn();
    alertsAdminAreasLevelService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('GLAD alerts selected timeframe WEEK', async () => {
    alertsAdminAreasLevelService.start(filters);
    alertsAdminAreasLevelService.process(alertsData);

    await alertsAdminAreasLevelService.finish(filters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,# of Sub State Level Alerts,# of State Level Alerts,# of Country Level Alerts',
      'WRI,Alberdi,Santiago del Estero,Argentina,Deforestation (Integrated Alerts),WEEK,01 Jan 2021,31 Jan 2021,1,1,2',
      'WRI,Independencia,Chaco,Argentina,Deforestation (Integrated Alerts),WEEK,01 Jan 2021,31 Jan 2021,1,1,2',
      'WRI,Gaúcha do Norte,Mato Grosso,Brazil,Deforestation (Integrated Alerts),WEEK,01 Jan 2021,31 Jan 2021,1180,1180,1180',
      '',
    ]);
  });

  test('GLAD alerts selected timeframe MONTH', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'MONTH',
    };

    alertsAdminAreasLevelService.start(newFilters);
    alertsAdminAreasLevelService.process(alertsData);

    await alertsAdminAreasLevelService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,# of Sub State Level Alerts,# of State Level Alerts,# of Country Level Alerts',
      'WRI,Alberdi,Santiago del Estero,Argentina,Deforestation (Integrated Alerts),MONTH,01 Jan 2021,31 Jan 2021,1,1,2',
      'WRI,Independencia,Chaco,Argentina,Deforestation (Integrated Alerts),MONTH,01 Jan 2021,31 Jan 2021,1,1,2',
      'WRI,Gaúcha do Norte,Mato Grosso,Brazil,Deforestation (Integrated Alerts),MONTH,01 Jan 2021,31 Jan 2021,1180,1180,1180',
      '',
    ]);
  });

  test('GLAD alerts selected timeframe YEAR', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'YEAR',
    };

    alertsAdminAreasLevelService.start(newFilters);
    alertsAdminAreasLevelService.process(alertsData);

    await alertsAdminAreasLevelService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,# of Sub State Level Alerts,# of State Level Alerts,# of Country Level Alerts',
      'WRI,Alberdi,Santiago del Estero,Argentina,Deforestation (Integrated Alerts),YEAR,01 Jan 2021,31 Jan 2021,1,1,2',
      'WRI,Independencia,Chaco,Argentina,Deforestation (Integrated Alerts),YEAR,01 Jan 2021,31 Jan 2021,1,1,2',
      'WRI,Gaúcha do Norte,Mato Grosso,Brazil,Deforestation (Integrated Alerts),YEAR,01 Jan 2021,31 Jan 2021,1180,1180,1180',
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

    alertsAdminAreasLevelService.start(newFilters);
    alertsAdminAreasLevelService.process(alertsData);

    await alertsAdminAreasLevelService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,# of Sub State Level Alerts,# of State Level Alerts,# of Country Level Alerts',
      'WRI,Alberdi,Santiago del Estero,Argentina,FIRES (VIIRS),WEEK,01 Apr 2023,30 Apr 2023,0,0,4',
      'WRI,Independencia,Chaco,Argentina,FIRES (VIIRS),WEEK,01 Apr 2023,30 Apr 2023,4,4,4',
      'WRI,Gaúcha do Norte,Mato Grosso,Brazil,FIRES (VIIRS),WEEK,01 Apr 2023,30 Apr 2023,52,52,52',
      '',
    ]);
  });
});
