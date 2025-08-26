import { describe, expect, test } from '@jest/globals';
import { ghgAnalysesData, ghgAnalysesDataIncompleteRow } from '../shared/mock.data';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { GhgRawEmissions } from './ghg.raw.emissions.service';

describe('Green House Gas Emissions Service - [Location level]', () => {
  const ghgRawEmissionsService = new GhgRawEmissions();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_ghg_raw_emissions.csv`;

  beforeAll(() => {
    ghgRawEmissionsService.startEmail = jest.fn();
    ghgRawEmissionsService.errorEmail = jest.fn();
    ghgRawEmissionsService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    ghgRawEmissionsService.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When the input data is ok', async () => {
    ghgRawEmissionsService.process(ghgAnalysesData);

    await ghgRawEmissionsService.finish(filters);

    const csvData = fs.readFileSync(filePath);
    const lines = csvData.toString().split('\n');
    const expectedResults = [
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Raw Emissions,CH4 Raw Emissions,N2O Raw Emissions,Combined Raw Emissions,Year',
      '"kgTestCG3 927 all","location name 2",1256.1647,Soy,dLUC,0,0,0,0,2025',
      '"kgTestCG3 927 all","location name 3",1256.4204,Soy,dLUC,0,0,0,0,2025',
      '"kgTestCG3 927 all","location name 1",1256.2173,Soy,dLUC,0,0,0,0,2025',
      '',
    ];
    expect(lines).toStrictEqual(expectedResults);
  });

  test('When receive an empty input array', async () => {
    ghgRawEmissionsService.process([]);

    await ghgRawEmissionsService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Raw Emissions,CH4 Raw Emissions,N2O Raw Emissions,Combined Raw Emissions,Year',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    ghgRawEmissionsService.process(undefined);

    await ghgRawEmissionsService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');

    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Raw Emissions,CH4 Raw Emissions,N2O Raw Emissions,Combined Raw Emissions,Year',
      '',
    ]);
  });
  test('When the input is incomplete rows', async () => {
    ghgRawEmissionsService.process(ghgAnalysesDataIncompleteRow);

    await ghgRawEmissionsService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Raw Emissions,CH4 Raw Emissions,N2O Raw Emissions,Combined Raw Emissions,Year',
      '"kgTestCG3 927 all","location name 2",1256.1647,Soy,dLUC,0,0,0,0,2025',
      '"kgTestCG3 927 all","location name 1",1256.2173,Soy,dLUC,0,0,0,0,2025',
      '',
    ]);
  });
});
