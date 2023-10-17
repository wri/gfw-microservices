import { locationListData } from '../shared/mock.data';
import { InputService } from './input.service';
import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';

describe('Input Service', () => {
  const inputService = new InputService();

  beforeAll(() => {
    inputService.startEmail = jest.fn();
    inputService.errorEmail = jest.fn();
    inputService.finishedEmail = jest.fn();
    inputService.uploadToS3 = jest.fn();
  });

  afterEach(() => {
    fs.unlinkSync('/tmp/tmp-input.csv');
  });

  test('when data has 3 locations', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-input',
      templateId: 13,
      combinedColumnsSplitted: [],
      selectedLocationsList: [],
    };

    inputService.start(filters);

    inputService.process(locationListData);

    await inputService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-input.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Supplier Name,Facility Name,Refinery Name,Certification,Start Date,End Date,Time Horizon',
      'L1,-8.9,-67,2,1255.8266657226563,Property,,0,,,,,,,,,,',
      'L2,-8.7,-66.8,2,1255.8266654785157,Property,,0,,,,,,,,,,',
      'L3,-9.4,-67.8,2,1255.826666015625,Property,,0,,,,,,,,,,',
      '',
    ]);
  });

  test('when want to generate file for specific location', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-input',
      templateId: 13,
      combinedColumnsSplitted: [],
      selectedLocationsList: [1],
    };

    inputService.start(filters);

    inputService.process(locationListData);

    await inputService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-input.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Supplier Name,Facility Name,Refinery Name,Certification,Start Date,End Date,Time Horizon',
      'L2,-8.7,-66.8,2,1255.8266654785157,Property,,0,,,,,,,,,,',
      '',
    ]);
  });

  test('when want to add more columns', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-input',
      templateId: 13,
      combinedColumnsSplitted: ['Country'],
      selectedLocationsList: [],
    };

    inputService.start(filters);

    inputService.process(locationListData);

    await inputService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-input.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Supplier Name,Facility Name,Refinery Name,Certification,Start Date,End Date,Time Horizon,Country',
      'L1,-8.9,-67,2,1255.8266657226563,Property,,0,,,,,,,,,,,Brazil',
      'L2,-8.7,-66.8,2,1255.8266654785157,Property,,0,,,,,,,,,,,Brazil',
      'L3,-9.4,-67.8,2,1255.826666015625,Property,,0,,,,,,,,,,,Brazil',
      '',
    ]);
  });

  test('when input is an empty array', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-input',
      templateId: 13,
      combinedColumnsSplitted: [],
      selectedLocationsList: [],
    };

    inputService.start(filters);

    inputService.process([]);

    await inputService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-input.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Supplier Name,Facility Name,Refinery Name,Certification,Start Date,End Date,Time Horizon',
      '',
    ]);
  });

  test('when input is undefined', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-input',
      templateId: 13,
      combinedColumnsSplitted: [],
      selectedLocationsList: [],
    };

    inputService.start(filters);

    inputService.process(undefined);

    await inputService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-input.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Supplier Name,Facility Name,Refinery Name,Certification,Start Date,End Date,Time Horizon',
      '',
    ]);
  });
});
