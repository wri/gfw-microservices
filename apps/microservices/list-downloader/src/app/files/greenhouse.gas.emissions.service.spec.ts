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
      'List Name,Location Name,Country,State,Sub State,Location Size (Ha),Commodity,Data Layer Name,CO2 Emissions Factor,CH4 Emissions Factor,N2O Emissions Factor,Combined Emissions Factor,Reporting Year',
      '"kgTestCG3 927 all","location name 2","Country Name","State Name","Sub State Name",1256.1647,Soy,dLUC,20.8186,220.8186,320.8186,120.8186,2021',
      '"kgTestCG3 927 all","location name 2","Country Name","State Name","Sub State Name",1256.1647,Soy,dLUC,28.1142,228.1142,328.1142,228.1142,2022',
      '"kgTestCG3 927 all","location name 2","Country Name","State Name","Sub State Name",1256.1647,Soy,dLUC,10,20,3,0,2023',
      '"kgTestCG3 927 all","location name 3","Country Name","State Name","Sub State Name",1256.4204,Soy,dLUC,40.8186,420.8186,420.8186,148.3792,2021',
      '"kgTestCG3 927 all","location name 3","Country Name","State Name","Sub State Name",1256.4204,Soy,dLUC,48.1142,428.1142,428.1142,243.5327,2022',
      '"kgTestCG3 927 all","location name 3","Country Name","State Name","Sub State Name",1256.4204,Soy,dLUC,410,420,43,0,2023',
      '"kgTestCG3 927 all","location name 1","Country Name","State Name","Sub State Name",1256.2173,Soy,dLUC,50.8186,520.8186,520.8186,148.3792,2021',
      '"kgTestCG3 927 all","location name 1","Country Name","State Name","Sub State Name",1256.2173,Soy,dLUC,58.1142,528.1142,528.1142,243.5327,2022',
      '"kgTestCG3 927 all","location name 1","Country Name","State Name","Sub State Name",1256.2173,Soy,dLUC,510,520,53,0,2023',
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
      'List Name,Location Name,Country,State,Sub State,Location Size (Ha),Commodity,Data Layer Name,CO2 Emissions Factor,CH4 Emissions Factor,N2O Emissions Factor,Combined Emissions Factor,Reporting Year',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    greenHouseGasEmissionsGeneratorService.process(undefined);

    await greenHouseGasEmissionsGeneratorService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');

    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Location Size (Ha),Commodity,Data Layer Name,CO2 Emissions Factor,CH4 Emissions Factor,N2O Emissions Factor,Combined Emissions Factor,Reporting Year',
      '',
    ]);
  });
  test('When the input is incomplete rows', async () => {
    greenHouseGasEmissionsGeneratorService.process(ghgAnalysesDataIncompleteRow);

    await greenHouseGasEmissionsGeneratorService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Location Size (Ha),Commodity,Data Layer Name,CO2 Emissions Factor,CH4 Emissions Factor,N2O Emissions Factor,Combined Emissions Factor,Reporting Year',
      '"kgTestCG3 927 all","location name 2","Country Name","State Name","Sub State Name",1256.1647,Soy,dLUC,50.8186,520.8186,520.8186,120.8186,2021',
      '"kgTestCG3 927 all","location name 2","Country Name","State Name","Sub State Name",1256.1647,Soy,dLUC,58.1142,528.1142,528.1142,228.1142,2022',
      '"kgTestCG3 927 all","location name 2","Country Name","State Name","Sub State Name",1256.1647,Soy,dLUC,510,520,53,0,2023',
      '"kgTestCG3 927 all","location name 1","Country Name","State Name","Sub State Name",1256.2173,Soy,dLUC,50.8186,520.8186,520.8186,148.3792,2021',
      '"kgTestCG3 927 all","location name 1","Country Name","State Name","Sub State Name",1256.2173,Soy,dLUC,58.1142,528.1142,528.1142,243.5327,2022',
      '"kgTestCG3 927 all","location name 1","Country Name","State Name","Sub State Name",1256.2173,Soy,dLUC,510,53,520,0,2023',
      '',
    ]);
  });
});
