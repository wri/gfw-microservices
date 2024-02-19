import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { alertsData } from '../shared/mock.data';
import { AlertsPrioritiesAdminAreasLevelService } from './alerts.priorities.admin.areas.level.service';

describe('Alerts Priorities Admin Areas Level Service', () => {
  const alertsPrioritiesAdminAreasLevelService = new AlertsPrioritiesAdminAreasLevelService();

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
  const filePath = `${dir}/${filters.listName}_AlertsPriorities_AdminAreasLevel.csv`;

  const readCsvData = (filePath: string) => {
    const csvData = fs.readFileSync(filePath, 'utf8');
    return csvData.toString().split('\n');
  };

  beforeAll(() => {
    alertsPrioritiesAdminAreasLevelService.startEmail = jest.fn();
    alertsPrioritiesAdminAreasLevelService.errorEmail = jest.fn();
    alertsPrioritiesAdminAreasLevelService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('GLAD alerts selected timeframe WEEK', async () => {
    alertsPrioritiesAdminAreasLevelService.start(filters);
    alertsPrioritiesAdminAreasLevelService.process(alertsData);

    await alertsPrioritiesAdminAreasLevelService.finish(filters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Sub State Level Alerts (Alerts / 1000 ha),Current Density of State Level Alerts (Alerts / 1000 ha),Current Density of Country Level Alerts (Alerts / 1000 ha)',
      'WRI,Alberdi,Santiago del Estero,Argentina,Deforestation (Integrated Alerts),WEEK,01 Jan 2021,31 Jan 2021,0.0000030125026523880853,0.0000030125026523880853,0.000006025005304776171',
      'WRI,Independencia,Chaco,Argentina,Deforestation (Integrated Alerts),WEEK,01 Jan 2021,31 Jan 2021,0.000011225851134266509,0.000011225851134266509,0.000022451702268533018',
      'WRI,Gaúcha do Norte,Mato Grosso,Brazil,Deforestation (Integrated Alerts),WEEK,01 Jan 2021,31 Jan 2021,0.0010014240750210173,0.0010014240750210173,0.0010014240750210173',
      '',
    ]);
  });

  test('GLAD alerts selected timeframe MONTH', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'MONTH',
    };

    alertsPrioritiesAdminAreasLevelService.start(newFilters);
    alertsPrioritiesAdminAreasLevelService.process(alertsData);

    await alertsPrioritiesAdminAreasLevelService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Sub State Level Alerts (Alerts / 1000 ha),Current Density of State Level Alerts (Alerts / 1000 ha),Current Density of Country Level Alerts (Alerts / 1000 ha)',
      'WRI,Alberdi,Santiago del Estero,Argentina,Deforestation (Integrated Alerts),MONTH,01 Jan 2021,31 Jan 2021,0.0000030125026523880853,0.0000030125026523880853,0.000006025005304776171',
      'WRI,Independencia,Chaco,Argentina,Deforestation (Integrated Alerts),MONTH,01 Jan 2021,31 Jan 2021,0.000011225851134266509,0.000011225851134266509,0.000022451702268533018',
      'WRI,Gaúcha do Norte,Mato Grosso,Brazil,Deforestation (Integrated Alerts),MONTH,01 Jan 2021,31 Jan 2021,0.0010014240750210173,0.0010014240750210173,0.0010014240750210173',
      '',
    ]);
  });

  test('GLAD alerts selected timeframe YEAR', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'YEAR',
    };

    alertsPrioritiesAdminAreasLevelService.start(newFilters);
    alertsPrioritiesAdminAreasLevelService.process(alertsData);

    await alertsPrioritiesAdminAreasLevelService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Sub State Level Alerts (Alerts / 1000 ha),Current Density of State Level Alerts (Alerts / 1000 ha),Current Density of Country Level Alerts (Alerts / 1000 ha)',
      'WRI,Alberdi,Santiago del Estero,Argentina,Deforestation (Integrated Alerts),YEAR,01 Jan 2021,31 Jan 2021,0.0000030125026523880853,0.0000030125026523880853,0.000006025005304776171',
      'WRI,Independencia,Chaco,Argentina,Deforestation (Integrated Alerts),YEAR,01 Jan 2021,31 Jan 2021,0.000011225851134266509,0.000011225851134266509,0.000022451702268533018',
      'WRI,Gaúcha do Norte,Mato Grosso,Brazil,Deforestation (Integrated Alerts),YEAR,01 Jan 2021,31 Jan 2021,0.0010014240750210173,0.0010014240750210173,0.0010014240750210173',
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

    alertsPrioritiesAdminAreasLevelService.start(newFilters);
    alertsPrioritiesAdminAreasLevelService.process(alertsData);

    await alertsPrioritiesAdminAreasLevelService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Sub State Level Alerts (Alerts / 1000 ha),Current Density of State Level Alerts (Alerts / 1000 ha),Current Density of Country Level Alerts (Alerts / 1000 ha)',
      'WRI,Alberdi,Santiago del Estero,Argentina,FIRES (VIIRS),WEEK,01 Apr 2023,30 Apr 2023,0,0,0.000012050010609552341',
      'WRI,Independencia,Chaco,Argentina,FIRES (VIIRS),WEEK,01 Apr 2023,30 Apr 2023,0.000044903404537066036,0.000044903404537066036,0.000044903404537066036',
      'WRI,Gaúcha do Norte,Mato Grosso,Brazil,FIRES (VIIRS),WEEK,01 Apr 2023,30 Apr 2023,0.0000441305524585533,0.0000441305524585533,0.0000441305524585533',
      '',
    ]);
  });
});
