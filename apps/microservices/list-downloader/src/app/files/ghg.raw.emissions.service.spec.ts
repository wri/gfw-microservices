import { describe, expect, test } from '@jest/globals';
import { ghgAnalysesData, ghgAnalysesDataIncompleteRow } from '../shared/mock.data';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { GhgRawEmissions } from './ghg.raw.emissions.service';
import { GHGAnalysisDataByListId } from '@wri-monorepos/sql';

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
    ghgRawEmissionsService.process(ghgAnalysesData as unknown as GHGAnalysisDataByListId[]);

    await ghgRawEmissionsService.finish(filters);

    const csvData = fs.readFileSync(filePath);
    const lines = csvData.toString().split('\n');

    // Check header
    expect(lines[0]).toBe(
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Raw Emissions,CH4 Raw Emissions,N2O Raw Emissions,Combined Raw Emissions,Year'
    );

    // Check that we have the expected number of data rows (excluding header and empty line)
    const dataLines = lines.slice(1).filter((line) => line.trim() !== '');
    expect(dataLines).toHaveLength(3);

    // Check that all expected rows are present (order-independent)
    const expectedRows = [
      '"kgTestCG3 927 all","location name 2",1256.1647,Soy,dLUC,0,0,0,0,2025',
      '"kgTestCG3 927 all","location name 3",1256.4204,Soy,dLUC,0,0,0,0,2025',
      '"kgTestCG3 927 all","location name 1",1256.2173,Soy,dLUC,0,0,0,0,2025',
    ];

    expectedRows.forEach((expectedRow) => {
      expect(dataLines).toContain(expectedRow);
    });

    // Check that last line is empty
    expect(lines[lines.length - 1]).toBe('');
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
    ghgRawEmissionsService.process(
      ghgAnalysesDataIncompleteRow as unknown as GHGAnalysisDataByListId[]
    );

    await ghgRawEmissionsService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
<<<<<<< HEAD

    // Check header
    expect(lines[0]).toBe(
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Raw Emissions,CH4 Raw Emissions,N2O Raw Emissions,Combined Raw Emissions,Year'
    );

    // Check that we have the expected number of data rows (excluding header and empty line)
    const dataLines = lines.slice(1).filter((line) => line.trim() !== '');
    expect(dataLines).toHaveLength(2);

    // Check that all expected rows are present (order-independent)
    const expectedRows = [
      '"kgTestCG3 927 all","location name 2",1256.1647,Soy,dLUC,0,0,0,0,2025',
      '"kgTestCG3 927 all","location name 1",1256.2173,Soy,dLUC,0,0,0,0,2025',
    ];

    expectedRows.forEach((expectedRow) => {
      expect(dataLines).toContain(expectedRow);
    });

    // Check that last line is empty
    expect(lines[lines.length - 1]).toBe('');
=======
    expect(lines).toStrictEqual([
      'List Name,Location Name,Location Size (Ha),Commodity,Data Layer Name,CO2 Raw Emissions,CH4 Raw Emissions,N2O Raw Emissions,Combined Raw Emissions,Year',
      '"kgTestCG3 927 all","location name 2",1256.1647,Soy,dLUC,0,0,0,0,2026',
      '"kgTestCG3 927 all","location name 1",1256.2173,Soy,dLUC,0,0,0,0,2026',
      '',
    ]);
>>>>>>> 46a99aeb (Fix tests)
  });
});
