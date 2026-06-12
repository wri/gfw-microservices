import { Logger } from '@nestjs/common';
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
  const zipPath = `/tmp/${filters.key}.zip`;

  const waitForExpectation = async (assertion: () => void) => {
    let lastError: unknown = new Error('Expectation timed out');

    for (let attempt = 0; attempt < 20; attempt += 1) {
      try {
        assertion();
        return;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    throw lastError;
  };

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
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    jest.restoreAllMocks();
  });

  test('when data has 3 locations', async () => {
    inputService.process(locationListData);

    await inputService.finish(filters);

    const csvData = fs.readFileSync(`${dir}/${filters.listName}_input.csv`, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area,Commodity,Country,State,Sub State,Location Classification,Company ID,ID,Volume,Parent Company,Supplier Name,Refinery Name,Second Supplier Name,Second Refinery Name,Verified?,Oil Type,RSPO Model,Certification,Direct FFB,Other FFB,Associated Smallholder FFB,Independent Smallholder FFB,Start Date,End Date,Time Horizon,Accuracy Rating of Location Entered,Wind Barrier,Riparian Buffers,Buffer Zones,Alternative Mill Name,Group Name',
      'L1,-8.9,-67,,1255.83,Cocoa,Brazil,Amazonas,Lábrea,Property,,,0,,,,,,,,,,,,,,,,,0,,,,,',
      'L2,-8.7,-66.8,,1255.83,Cocoa,Brazil,Amazonas,Lábrea,Property,,,0,,,,,,,,,,,,,,,,,0,,,,,',
      'L3,-9.4,-67.8,,1255.83,Cocoa,Brazil,Acre,Porto Acre,Property,,,0,,,,,,,,,,,,,,,,,0,,,,,',
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
      'L2,-8.7,-66.8,,1255.83,Cocoa,Brazil,Amazonas,Lábrea,Property,,,0,,,,,,,,,,,,,,,,,0,,,,,',
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
      'L1,-8.9,-67,,1255.83,Cocoa,Brazil,Amazonas,Lábrea,Property,,,0,,,,,,,,,,,,,,,,,0,,,,,',
      'L2,-8.7,-66.8,,1255.83,Cocoa,Brazil,Amazonas,Lábrea,Property,,,0,,,,,,,,,,,,,,,,,0,,,,,',
      'L3,-9.4,-67.8,,1255.83,Cocoa,Brazil,Acre,Porto Acre,Property,,,0,,,,,,,,,,,,,,,,,0,,,,,',
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

  test('when finishProcess rejects after zipping, it logs the failure without rejecting finish', async () => {
    const finishError = new Error('finish failed');
    const finishProcessMock = jest.fn().mockRejectedValue(finishError);
    const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());

    inputService.finishProcess = finishProcessMock;
    inputService.process(locationListData);

    await expect(inputService.finish(filters)).resolves.toBeUndefined();

    await waitForExpectation(() => {
      expect(finishProcessMock).toHaveBeenCalledWith(filters);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `(${filters.listId}) - Failed while finishing download`,
        finishError
      );
    });
  });
});
