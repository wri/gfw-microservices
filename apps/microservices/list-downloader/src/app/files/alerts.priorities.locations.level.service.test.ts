import { AlertsPrioritiesLocationsLevelService } from './alerts.priorities.locations.level.service';
import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { alertsData } from '../shared/mock.data';

describe('Alerts Priorities Locations Level Service', () => {
  const alertsPrioritiesLocationsLevelService = new AlertsPrioritiesLocationsLevelService();

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
  const filePath = `${dir}/${filters.listName}_AlertsPriorities_LocationsLevel.csv`;

  const readCsvData = (filePath: string) => {
    const csvData = fs.readFileSync(filePath, 'utf8');
    return csvData.toString().split('\n');
  };

  beforeAll(() => {
    alertsPrioritiesLocationsLevelService.startEmail = jest.fn();
    alertsPrioritiesLocationsLevelService.errorEmail = jest.fn();
    alertsPrioritiesLocationsLevelService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('GLAD alerts selected timeframe WEEK', async () => {
    await alertsPrioritiesLocationsLevelService.start(filters);
    alertsPrioritiesLocationsLevelService.process(alertsData);

    await alertsPrioritiesLocationsLevelService.finish(filters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Location Level Alerts (Alerts / 1000 ha)',
      'WRI,BRA.12.116_1,Sinop,Mato Grosso,Brazil,Deforestation (Integrated Alerts),WEEK,01 Jan 2021,31 Jan 2021,0.0055489093573243',
      'WRI,Presidencia de la Plaza,Presidencia de la Plaza,Chaco,Argentina,Deforestation (Integrated Alerts),WEEK,01 Jan 2021,31 Jan 2021,0.00000894748006629614',
      'WRI,Sargento Cabral,Sargento Cabral,Chaco,Argentina,Deforestation (Integrated Alerts),WEEK,01 Jan 2021,31 Jan 2021,0',
      '',
    ]);
  });

  test('GLAD alerts selected timeframe MONTH', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'MONTH',
    };

    await alertsPrioritiesLocationsLevelService.start(newFilters);
    alertsPrioritiesLocationsLevelService.process(alertsData);

    await alertsPrioritiesLocationsLevelService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Location Level Alerts (Alerts / 1000 ha)',
      'WRI,BRA.12.116_1,Sinop,Mato Grosso,Brazil,Deforestation (Integrated Alerts),MONTH,01 Jan 2021,31 Jan 2021,0.0055489093573243',
      'WRI,Presidencia de la Plaza,Presidencia de la Plaza,Chaco,Argentina,Deforestation (Integrated Alerts),MONTH,01 Jan 2021,31 Jan 2021,0.00000894748006629614',
      'WRI,Sargento Cabral,Sargento Cabral,Chaco,Argentina,Deforestation (Integrated Alerts),MONTH,01 Jan 2021,31 Jan 2021,0',
      '',
    ]);
  });

  test('GLAD alerts selected timeframe YEAR', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'YEAR',
    };

    await alertsPrioritiesLocationsLevelService.start(newFilters);
    alertsPrioritiesLocationsLevelService.process(alertsData);

    await alertsPrioritiesLocationsLevelService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Location Level Alerts (Alerts / 1000 ha)',
      'WRI,BRA.12.116_1,Sinop,Mato Grosso,Brazil,Deforestation (Integrated Alerts),YEAR,01 Jan 2021,31 Jan 2021,0.0055489093573243',
      'WRI,Presidencia de la Plaza,Presidencia de la Plaza,Chaco,Argentina,Deforestation (Integrated Alerts),YEAR,01 Jan 2021,31 Jan 2021,0.00000894748006629614',
      'WRI,Sargento Cabral,Sargento Cabral,Chaco,Argentina,Deforestation (Integrated Alerts),YEAR,01 Jan 2021,31 Jan 2021,0',
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

    await alertsPrioritiesLocationsLevelService.start(newFilters);
    alertsPrioritiesLocationsLevelService.process(alertsData);

    await alertsPrioritiesLocationsLevelService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Sub State,State,Country,Alert Type,Timeframe,Start Date,End Date,Current Density of Location Level Alerts (Alerts / 1000 ha)',
      'WRI,BRA.12.116_1,Sinop,Mato Grosso,Brazil,FIRES (VIIRS),WEEK,01 Apr 2023,30 Apr 2023,0.000011009740788341863',
      'WRI,Presidencia de la Plaza,Presidencia de la Plaza,Chaco,Argentina,FIRES (VIIRS),WEEK,01 Apr 2023,30 Apr 2023,0',
      'WRI,Sargento Cabral,Sargento Cabral,Chaco,Argentina,FIRES (VIIRS),WEEK,01 Apr 2023,30 Apr 2023,0',
      '',
    ]);
  });
});
