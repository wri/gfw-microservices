import { describe, expect, test } from '@jest/globals';
import { ghgAnalysesData, ghgAnalysesDataIncompleteRow } from '../shared/mock.data';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { GreenHouseGasEmissionsService } from './greenhouse.gas.emissions.service';

describe('Green House Gas Emissions Service - [Location level]', () => {
  const greenHouseGasEmissionsGeneratorService = new GreenHouseGasEmissionsService();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_green_house_gas_emissions.csv`;

  beforeAll(() => {
    greenHouseGasEmissionsGeneratorService.startEmail = jest.fn();
    greenHouseGasEmissionsGeneratorService.errorEmail = jest.fn();
    greenHouseGasEmissionsGeneratorService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    greenHouseGasEmissionsGeneratorService.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When the input data is ok', async () => {
    greenHouseGasEmissionsGeneratorService.process(ghgAnalysesData);

    await greenHouseGasEmissionsGeneratorService.finish(filters);

    const csvData = fs.readFileSync(filePath);
    const lines = csvData.toString().split('\n');

    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (HA),Commodity,Data Layer Name,Emissions Factor,year',
      'kgTestCG3 927 all,2,1256.16,Soybeans,dLUC,120.82,2021',
      'kgTestCG3 927 all,2,1256.16,Soybeans,dLUC,228.11,2022',
      'kgTestCG3 927 all,2,1256.16,Soybeans,dLUC,0,2023',
      'kgTestCG3 927 all,3,1256.42,Soybeans,dLUC,148.38,2021',
      'kgTestCG3 927 all,3,1256.42,Soybeans,dLUC,243.53,2022',
      'kgTestCG3 927 all,3,1256.42,Soybeans,dLUC,0,2023',
      'kgTestCG3 927 all,1,1256.22,Soybeans,dLUC,148.38,2021',
      'kgTestCG3 927 all,1,1256.22,Soybeans,dLUC,243.53,2022',
      'kgTestCG3 927 all,1,1256.22,Soybeans,dLUC,0,2023',
      '',
    ]);
  });

  test('When receive an empty input array', async () => {
    greenHouseGasEmissionsGeneratorService.process([]);

    await greenHouseGasEmissionsGeneratorService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (HA),Commodity,Data Layer Name,Emissions Factor,year',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    greenHouseGasEmissionsGeneratorService.process(undefined);

    await greenHouseGasEmissionsGeneratorService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');

    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (HA),Commodity,Data Layer Name,Emissions Factor,year',
      '',
    ]);
  });
  test('When the input is incomplete rows', async () => {
    greenHouseGasEmissionsGeneratorService.process(ghgAnalysesDataIncompleteRow);

    await greenHouseGasEmissionsGeneratorService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (HA),Commodity,Data Layer Name,Emissions Factor,year',
      'kgTestCG3 927 all,2,1256.16,Soybeans,dLUC,120.82,2021',
      'kgTestCG3 927 all,2,1256.16,Soybeans,dLUC,228.11,2022',
      'kgTestCG3 927 all,2,1256.16,Soybeans,dLUC,0,2023',
      'kgTestCG3 927 all,1,1256.22,Soybeans,dLUC,148.38,2021',
      'kgTestCG3 927 all,1,1256.22,Soybeans,dLUC,243.53,2022',
      'kgTestCG3 927 all,1,1256.22,Soybeans,dLUC,0,2023',
      '',
    ]);
  });
});
