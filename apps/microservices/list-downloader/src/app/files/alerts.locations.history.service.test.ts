import { describe, expect, test } from '@jest/globals';
import { AlertsLocationsHistoryService } from './alerts.locations.history.service';
import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { alertsData } from '../shared/mock.data';

const duplicatedRow = [
  {
    list_id: 5479,
    location_id: 31,
    gadm_id: 'ARG.3.18',
    gladAlerts: true,
    glad_alerts_daily: [
      {
        day: '2021-01-02',
        count: 1,
      },
      {
        day: '2021-08-30',
        count: 1,
      },
      {
        day: '2021-09-15',
        count: 18,
      },
      {
        day: '2021-10-25',
        count: 16,
      },
      {
        day: '2021-11-02',
        count: 13,
      },
      {
        day: '2021-11-18',
        count: 28,
      },
      {
        day: '2021-11-26',
        count: 4,
      },
      {
        day: '2022-02-06',
        count: 6,
      },
      {
        day: '2022-10-04',
        count: 6,
      },
      {
        day: '2022-10-23',
        count: 2,
      },
      {
        day: '2022-11-05',
        count: 24,
      },
      {
        day: '2022-12-07',
        count: 7,
      },
      {
        day: '2023-01-16',
        count: 3,
      },
      {
        day: '2023-01-21',
        count: 1,
      },
      {
        day: '2023-01-24',
        count: 7,
      },
      {
        day: '2023-02-09',
        count: 6,
      },
      {
        day: '2023-02-24',
        count: 3,
      },
      {
        day: '2023-02-25',
        count: 15,
      },
      {
        day: '2023-03-13',
        count: 2,
      },
    ],
    glad_alerts_weekly: [
      {
        day: '2020-53',
        count: 1,
      },
      {
        day: '2021-35',
        count: 1,
      },
      {
        day: '2021-37',
        count: 18,
      },
      {
        day: '2021-43',
        count: 16,
      },
      {
        day: '2021-44',
        count: 13,
      },
      {
        day: '2021-46',
        count: 28,
      },
      {
        day: '2021-47',
        count: 4,
      },
      {
        day: '2022-05',
        count: 6,
      },
      {
        day: '2022-40',
        count: 6,
      },
      {
        day: '2022-42',
        count: 2,
      },
      {
        day: '2022-44',
        count: 24,
      },
      {
        day: '2022-49',
        count: 7,
      },
      {
        day: '2023-03',
        count: 4,
      },
      {
        day: '2023-04',
        count: 7,
      },
      {
        day: '2023-06',
        count: 6,
      },
      {
        day: '2023-08',
        count: 18,
      },
      {
        day: '2023-11',
        count: 2,
      },
    ],
    glad_alerts_monthly: [
      {
        day: '2021-01',
        count: 1,
      },
      {
        day: '2021-08',
        count: 1,
      },
      {
        day: '2021-09',
        count: 18,
      },
      {
        day: '2021-10',
        count: 16,
      },
      {
        day: '2021-11',
        count: 45,
      },
      {
        day: '2022-02',
        count: 6,
      },
      {
        day: '2022-10',
        count: 8,
      },
      {
        day: '2022-11',
        count: 24,
      },
      {
        day: '2022-12',
        count: 7,
      },
      {
        day: '2023-01',
        count: 11,
      },
      {
        day: '2023-02',
        count: 24,
      },
      {
        day: '2023-03',
        count: 2,
      },
    ],
    viirs_alerts_daily: [],
    tree_cover_extent_total: 111763.3113,
    Country: 'Argentina',
    State: 'Chaco',
    'Sub State': 'Presidencia de la Plaza',
    name_all: 'Argentina--Chaco--Presidencia de la Plaza',
    gadmid: 'ARG.3.17',
    gadmid_2: 'ARG.3.17',
    gadmid_2_lat: -27.034819141438057,
    gadmid_2_lon: -59.791889606277486,
    gadmid_1: 'ARG.3',
    gadmid_1_lat: -26.38737547560391,
    gadmid_1_lon: -60.766741050280565,
    gadmid_0: 'ARG',
    gadmid_0_lat: -35.38996674867808,
    gadmid_0_lon: -65.1669824158997,
    location_lat: -27.03480718,
    location_lon: -59.79187348,
    location_name: 'Presidencia de la Plaza',
    fire: [],
    fireAlerts: true,
    umd: 111763.3113,
  },
];

describe('Alerts Locations History Service', () => {
  const alertsLocationsHistoryService = new AlertsLocationsHistoryService();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
    type: 'argentinaOverlap',
    selectedAlert: 'Integrated',
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

  test('Integrated alerts selected timeframe DAY', async () => {
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

  test('Integrated alerts with duplicated gadmid', async () => {
    const newFilters = {
      ...filters,
      selectedTimeframe: 'DAY',
    };
    alertsLocationsHistoryService.start(newFilters);
    alertsLocationsHistoryService.process([...alertsData, ...duplicatedRow]);

    await alertsLocationsHistoryService.finish(newFilters);
    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Alert Type,Start Date,End Date,Date,# of alerts for location',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),01 Jan 2021,31 Jan 2021,02 Jan 2021,638',
      'WRI,BRA.12.116_1,Deforestation (Integrated Alerts),01 Jan 2021,31 Jan 2021,26 Jan 2021,370',
      'WRI,Presidencia de la Plaza,Deforestation (Integrated Alerts),01 Jan 2021,31 Jan 2021,02 Jan 2021,2',
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
