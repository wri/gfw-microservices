import { describe, expect, test } from '@jest/globals';
import { ghgAnalysesData, ghgAnalysesDataIncompleteRow } from '../shared/mock.data';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { GhgIntermediateOutputs } from './ghg.intermediate.outputs.service';
import { GHGAnalysisDataByListId } from '@wri-monorepos/sql';

describe('Green House Gas Emissions Service - [Location level]', () => {
  const ghgIntermediateOutputsService = new GhgIntermediateOutputs();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_ghg_intermediate_outputs.csv`;

  beforeAll(() => {
    ghgIntermediateOutputsService.startEmail = jest.fn();
    ghgIntermediateOutputsService.errorEmail = jest.fn();
    ghgIntermediateOutputsService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    ghgIntermediateOutputsService.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When the input data is ok', async () => {
    ghgIntermediateOutputsService.process(ghgAnalysesData as unknown as GHGAnalysisDataByListId[]);

    await ghgIntermediateOutputsService.finish(filters);

    const csvData = fs.readFileSync(filePath);
    const lines = csvData.toString().split('\n');
    const expectedResults = [
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,Yield,Production,CO2 Linear Discounted Emissions,CH4 Linear Discounted Emissions,N2O Linear Discounted Emissions,Combined Linear Discounted Emissions,Reporting Year',
      '"kgTestCG3 927 all","location name 2",1256.1647,Soy,dLUC,0,0,0,0,0,0,2021',
      '"kgTestCG3 927 all","location name 2",1256.1647,Soy,dLUC,0,0,0,0,0,0,2022',
      '"kgTestCG3 927 all","location name 2",1256.1647,Soy,dLUC,0,0,0,0,0,0,2023',
      '"kgTestCG3 927 all","location name 3",1256.4204,Soy,dLUC,0,0,0,0,0,0,2021',
      '"kgTestCG3 927 all","location name 3",1256.4204,Soy,dLUC,0,0,0,0,0,0,2022',
      '"kgTestCG3 927 all","location name 3",1256.4204,Soy,dLUC,0,0,0,0,0,0,2023',
      '"kgTestCG3 927 all","location name 1",1256.2173,Soy,dLUC,0,0,0,0,0,0,2021',
      '"kgTestCG3 927 all","location name 1",1256.2173,Soy,dLUC,0,0,0,0,0,0,2022',
      '"kgTestCG3 927 all","location name 1",1256.2173,Soy,dLUC,0,0,0,0,0,0,2023',
      '',
    ];
    expect(lines).toStrictEqual(expectedResults);
  });

  test('When receive an empty input array', async () => {
    ghgIntermediateOutputsService.process([]);

    await ghgIntermediateOutputsService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,Yield,Production,CO2 Linear Discounted Emissions,CH4 Linear Discounted Emissions,N2O Linear Discounted Emissions,Combined Linear Discounted Emissions,Reporting Year',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    ghgIntermediateOutputsService.process(undefined);

    await ghgIntermediateOutputsService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');

    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,Yield,Production,CO2 Linear Discounted Emissions,CH4 Linear Discounted Emissions,N2O Linear Discounted Emissions,Combined Linear Discounted Emissions,Reporting Year',
      '',
    ]);
  });
  test('When the input is incomplete rows', async () => {
    ghgIntermediateOutputsService.process(
      ghgAnalysesDataIncompleteRow as unknown as GHGAnalysisDataByListId[]
    );

    await ghgIntermediateOutputsService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,Yield,Production,CO2 Linear Discounted Emissions,CH4 Linear Discounted Emissions,N2O Linear Discounted Emissions,Combined Linear Discounted Emissions,Reporting Year',
      '"kgTestCG3 927 all","location name 2",1256.1647,Soy,dLUC,0,0,0,0,0,0,2021',
      '"kgTestCG3 927 all","location name 2",1256.1647,Soy,dLUC,0,0,0,0,0,0,2022',
      '"kgTestCG3 927 all","location name 2",1256.1647,Soy,dLUC,0,0,0,0,0,0,2023',
      '"kgTestCG3 927 all","location name 1",1256.2173,Soy,dLUC,0,0,0,0,0,0,2021',
      '"kgTestCG3 927 all","location name 1",1256.2173,Soy,dLUC,0,0,0,0,0,0,2022',
      '"kgTestCG3 927 all","location name 1",1256.2173,Soy,dLUC,0,0,0,0,0,0,2023',
      '',
    ]);
  });
});
