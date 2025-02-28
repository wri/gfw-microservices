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
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Emissions Factor,CH4 Emissions Factor,N2O Emissions Factor,Combined Emissions Factor,Year',
      'kgTestCG3 927 all,2,1256.164682,Soy Generic,dLUC,0,0,0,120.8186,2021',
      'kgTestCG3 927 all,2,1256.164682,Soy Generic,dLUC,0,0,0,228.1142,2022',
      'kgTestCG3 927 all,2,1256.164682,Soy Generic,dLUC,0,0,0,0,2023',
      'kgTestCG3 927 all,3,1256.42037,Soy Generic,dLUC,0,0,0,148.3792,2021',
      'kgTestCG3 927 all,3,1256.42037,Soy Generic,dLUC,0,0,0,243.5327,2022',
      'kgTestCG3 927 all,3,1256.42037,Soy Generic,dLUC,0,0,0,0,2023',
      'kgTestCG3 927 all,1,1256.217339,Soy Generic,dLUC,0,0,0,148.3792,2021',
      'kgTestCG3 927 all,1,1256.217339,Soy Generic,dLUC,0,0,0,243.5327,2022',
      'kgTestCG3 927 all,1,1256.217339,Soy Generic,dLUC,0,0,0,0,2023',
      '',
    ]);
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
      'kgTestCG3 927 all,2,1256.164682,Soy Generic,dLUC,0,0,0,120.8186,2021',
      'kgTestCG3 927 all,2,1256.164682,Soy Generic,dLUC,0,0,0,228.1142,2022',
      'kgTestCG3 927 all,2,1256.164682,Soy Generic,dLUC,0,0,0,0,2023',
      'kgTestCG3 927 all,1,1256.217339,Soy Generic,dLUC,0,0,0,148.3792,2021',
      'kgTestCG3 927 all,1,1256.217339,Soy Generic,dLUC,0,0,0,243.5327,2022',
      'kgTestCG3 927 all,1,1256.217339,Soy Generic,dLUC,0,0,0,0,2023',
      '',
    ]);
  });
});
