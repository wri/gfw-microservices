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
    const expectedResults = [
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Emissions Factor,CH4 Emissions Factor,N2O Emissions Factor,Combined Emissions Factor,Year',
      'kgTestCG3 927 all,location name 2,1256.16,Soy Generic,dLUC,20.82,220.82,320.82,120.82,2021',
      'kgTestCG3 927 all,location name 2,1256.16,Soy Generic,dLUC,28.11,228.11,328.11,228.11,2022',
      'kgTestCG3 927 all,location name 2,1256.16,Soy Generic,dLUC,10,20,3,0,2023',
      'kgTestCG3 927 all,location name 3,1256.42,Soy Generic,dLUC,40.82,420.82,420.82,148.38,2021',
      'kgTestCG3 927 all,location name 3,1256.42,Soy Generic,dLUC,48.11,428.11,428.11,243.53,2022',
      'kgTestCG3 927 all,location name 3,1256.42,Soy Generic,dLUC,410,420,43,0,2023',
      'kgTestCG3 927 all,location name 1,1256.22,Soy Generic,dLUC,50.82,520.82,520.82,148.38,2021',
      'kgTestCG3 927 all,location name 1,1256.22,Soy Generic,dLUC,58.11,528.11,528.11,243.53,2022',
      'kgTestCG3 927 all,location name 1,1256.22,Soy Generic,dLUC,510,520,53,0,2023',
      '',
    ];
    expect(lines).toStrictEqual(expectedResults);
  });

  test('When receive an empty input array', async () => {
    greenHouseGasEmissionsGeneratorService.process([]);

    await greenHouseGasEmissionsGeneratorService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Emissions Factor,CH4 Emissions Factor,N2O Emissions Factor,Combined Emissions Factor,Year',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    greenHouseGasEmissionsGeneratorService.process(undefined);

    await greenHouseGasEmissionsGeneratorService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');

    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Emissions Factor,CH4 Emissions Factor,N2O Emissions Factor,Combined Emissions Factor,Year',
      '',
    ]);
  });
  test('When the input is incomplete rows', async () => {
    greenHouseGasEmissionsGeneratorService.process(ghgAnalysesDataIncompleteRow);

    await greenHouseGasEmissionsGeneratorService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Emissions Factor,CH4 Emissions Factor,N2O Emissions Factor,Combined Emissions Factor,Year',
      'kgTestCG3 927 all,location name 2,1256.16,Soy Generic,dLUC,50.82,520.82,520.82,120.82,2021',
      'kgTestCG3 927 all,location name 2,1256.16,Soy Generic,dLUC,58.11,528.11,528.11,228.11,2022',
      'kgTestCG3 927 all,location name 2,1256.16,Soy Generic,dLUC,510,520,53,0,2023',
      'kgTestCG3 927 all,location name 1,1256.22,Soy Generic,dLUC,50.82,520.82,520.82,148.38,2021',
      'kgTestCG3 927 all,location name 1,1256.22,Soy Generic,dLUC,58.11,528.11,528.11,243.53,2022',
      'kgTestCG3 927 all,location name 1,1256.22,Soy Generic,dLUC,510,53,520,0,2023',
      '',
    ]);
  });
});
