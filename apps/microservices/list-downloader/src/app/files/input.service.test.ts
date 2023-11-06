import { createDirectory } from '../shared/file.utils';
import { locationListData } from '../shared/mock.data';
import { InputService } from './input.service';
import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';

describe('Input Service', () => {
  const inputService = new InputService();

  const filters = {
    listId: 5642,
    key: 'tmp-input',
    templateId: 13,
    combinedColumnsSplitted: [],
    selectedLocationsList: [],
    listName: 'WRI',
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
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Supplier Name,Facility Name,Refinery Name,Certification,Start Date,End Date,Time Horizon',
      'L1,-8.9,-67,2,1255.83,Property,,0,,,,,,,,,,',
      'L2,-8.7,-66.8,2,1255.83,Property,,0,,,,,,,,,,',
      'L3,-9.4,-67.8,2,1255.83,Property,,0,,,,,,,,,,',
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
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Supplier Name,Facility Name,Refinery Name,Certification,Start Date,End Date,Time Horizon',
      'L2,-8.7,-66.8,2,1255.83,Property,,0,,,,,,,,,,',
      '',
    ]);
  });

  test('when want to add more columns', async () => {
    const newFilters = {
      ...filters,
      combinedColumnsSplitted: ['Country'],
    };

    inputService.start(newFilters);

    inputService.process(locationListData);

    await inputService.finish(newFilters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Supplier Name,Facility Name,Refinery Name,Certification,Start Date,End Date,Time Horizon,Country',
      'L1,-8.9,-67,2,1255.83,Property,,0,,,,,,,,,,,Brazil',
      'L2,-8.7,-66.8,2,1255.83,Property,,0,,,,,,,,,,,Brazil',
      'L3,-9.4,-67.8,2,1255.83,Property,,0,,,,,,,,,,,Brazil',
      '',
    ]);
  });

  test('when input is an empty array', async () => {
    inputService.process([]);

    await inputService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Supplier Name,Facility Name,Refinery Name,Certification,Start Date,End Date,Time Horizon',
      '',
    ]);
  });

  test('when input is undefined', async () => {
    inputService.process(undefined);

    await inputService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Supplier Name,Facility Name,Refinery Name,Certification,Start Date,End Date,Time Horizon',
      '',
    ]);
  });
});
