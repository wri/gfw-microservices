import { createDirectory } from '../shared/file.utils';
import { locationListData } from '../shared/mock.data';
import { InputService } from './input.service';
import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';

describe('Input Service', () => {
  const inputService = new InputService();

  const filters = {
    listId: 6013,
    key: 'tmp-input',
    combinedColumnsSplit: [],
    selectedLocationsList: [],
    listName: 'WRI',
    fields: [
      'Location Name',
      'Latitude',
      'Longitude',
      'Analysis Radius',
      'Analysis Area',
      'Commodity',
      'Country',
      'State',
      'Sub State',
      'Location Classification',
      'Company ID',
      'ID',
      'Volume',
      'Parent Company',
      'Supplier Name',
      'Refinery Name',
      'Second Supplier Name',
      'Second Refinery Name',
      'Verified?',
      'Oil Type',
      'RSPO Model',
      'Certification',
      'Direct FFB',
      'Other FFB',
      'Associated Smallholder FFB',
      'Independent Smallholder FFB',
      'Start Date',
      'End Date',
      'Time Horizon',
      'Accuracy Rating of Location Entered',
      'Wind Barrier',
      'Riparian Buffers',
      'Buffer Zones',
      'Alternative Mill Name',
      'Group Name',
    ],
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_input.csv`;

  beforeAll(() => {
    inputService.startEmail = jest.fn();
    inputService.errorEmail = jest.fn();
    inputService.finishedEmail = jest.fn();
    inputService.finishProcess = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    inputService.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(`${dir}/${filters.listName}_input.csv`);
  });

  test('when data has 3 locations', async () => {
    inputService.process(locationListData);

    await inputService.finish(filters);

    const csvData = fs.readFileSync(`${dir}/${filters.listName}_input.csv`, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Commodity,Country,State,Sub State,Location Classification,Company ID,ID,Volume,Parent Company,Supplier Name,Refinery Name,Second Supplier Name,Second Refinery Name,Verified?,Oil Type,RSPO Model,Certification,Direct FFB,Other FFB,Associated Smallholder FFB,Independent Smallholder FFB,Start Date,End Date,Time Horizon,Accuracy Rating of Location Entered,Wind Barrier,Riparian Buffers,Buffer Zones,Alternative Mill Name,Group Name',
      'LN1,-2.4,101.16,,542407.85,Palm Oil,Indonesia,Bengkulu,Mukomuko,Supply Shed,n/a,PO1000008174,0,USAHA SAWIT MANDIRI,,,,,,, ,None,0,0,0,0,,,,0,,,, ,SUPERVENTURE',
      'LN2,17,81.47,,785078.85,Palm Oil,India,Andhra Pradesh,West Godavari,Supply Shed,n/a,PO1000008590,0,3F OIL PALM AGROTECH,,,,,,, ,None,0,0,0,0,,,,0,,,, ,UNKNOWN',
      'LN3,4.29,-72.13,,785078.93,Palm Oil,Colombia,Meta,Puerto Gaitán,Supply Shed,n/a,PO1000008347,0,ABAGO S.A.S.,,,,,,, ,None,0,0,0,0,,,,0,,,,BRAGANZA,UNKNOWN',
      '',
    ]);
  });

  test('when want to generate file for specific location', async () => {
    const newFilters = {
      ...filters,
      selectedLocationsList: [1],
    };

    inputService.start(newFilters);

    inputService.process(locationListData);

    await inputService.finish(newFilters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Commodity,Country,State,Sub State,Location Classification,Company ID,ID,Volume,Parent Company,Supplier Name,Refinery Name,Second Supplier Name,Second Refinery Name,Verified?,Oil Type,RSPO Model,Certification,Direct FFB,Other FFB,Associated Smallholder FFB,Independent Smallholder FFB,Start Date,End Date,Time Horizon,Accuracy Rating of Location Entered,Wind Barrier,Riparian Buffers,Buffer Zones,Alternative Mill Name,Group Name',
      'LN3,4.29,-72.13,,785078.93,Palm Oil,Colombia,Meta,Puerto Gaitán,Supply Shed,n/a,PO1000008347,0,ABAGO S.A.S.,,,,,,, ,None,0,0,0,0,,,,0,,,,BRAGANZA,UNKNOWN',
      '',
    ]);
  });

  test('when want to add more columns', async () => {
    const newFilters = {
      ...filters,
      combinedColumnsSplit: ['Country'],
    };

    inputService.start(newFilters);

    inputService.process(locationListData);

    await inputService.finish(newFilters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Commodity,Country,State,Sub State,Location Classification,Company ID,ID,Volume,Parent Company,Supplier Name,Refinery Name,Second Supplier Name,Second Refinery Name,Verified?,Oil Type,RSPO Model,Certification,Direct FFB,Other FFB,Associated Smallholder FFB,Independent Smallholder FFB,Start Date,End Date,Time Horizon,Accuracy Rating of Location Entered,Wind Barrier,Riparian Buffers,Buffer Zones,Alternative Mill Name,Group Name',
      'LN1,-2.4,101.16,,542407.85,Palm Oil,Indonesia,Bengkulu,Mukomuko,Supply Shed,n/a,PO1000008174,0,USAHA SAWIT MANDIRI,,,,,,, ,None,0,0,0,0,,,,0,,,, ,SUPERVENTURE',
      'LN2,17,81.47,,785078.85,Palm Oil,India,Andhra Pradesh,West Godavari,Supply Shed,n/a,PO1000008590,0,3F OIL PALM AGROTECH,,,,,,, ,None,0,0,0,0,,,,0,,,, ,UNKNOWN',
      'LN3,4.29,-72.13,,785078.93,Palm Oil,Colombia,Meta,Puerto Gaitán,Supply Shed,n/a,PO1000008347,0,ABAGO S.A.S.,,,,,,, ,None,0,0,0,0,,,,0,,,,BRAGANZA,UNKNOWN',
      '',
    ]);
  });

  test('when input is an empty array', async () => {
    inputService.process([]);

    await inputService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Commodity,Country,State,Sub State,Location Classification,Company ID,ID,Volume,Parent Company,Supplier Name,Refinery Name,Second Supplier Name,Second Refinery Name,Verified?,Oil Type,RSPO Model,Certification,Direct FFB,Other FFB,Associated Smallholder FFB,Independent Smallholder FFB,Start Date,End Date,Time Horizon,Accuracy Rating of Location Entered,Wind Barrier,Riparian Buffers,Buffer Zones,Alternative Mill Name,Group Name',
      '',
    ]);
  });

  test('when input is undefined', async () => {
    inputService.process(undefined);

    await inputService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Commodity,Country,State,Sub State,Location Classification,Company ID,ID,Volume,Parent Company,Supplier Name,Refinery Name,Second Supplier Name,Second Refinery Name,Verified?,Oil Type,RSPO Model,Certification,Direct FFB,Other FFB,Associated Smallholder FFB,Independent Smallholder FFB,Start Date,End Date,Time Horizon,Accuracy Rating of Location Entered,Wind Barrier,Riparian Buffers,Buffer Zones,Alternative Mill Name,Group Name',
      '',
    ]);
  });
});
