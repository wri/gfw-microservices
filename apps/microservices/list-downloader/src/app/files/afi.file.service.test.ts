import { describe, expect, test } from '@jest/globals';
import { AfiFileService } from './afi.file.service';
import { afiListLevelData, afiLocationLevelData } from '../shared/mock.data';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { AfiAnalysisByListId } from '@wri-monorepos/sql';

describe('AFI File Service - [Location level]', () => {
  const afiFileService = new AfiFileService();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_deforestation_kpis.csv`;

  beforeAll(() => {
    afiFileService.startEmail = jest.fn();
    afiFileService.errorEmail = jest.fn();
    afiFileService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    afiFileService.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When the input data is ok', async () => {
    afiFileService.process(afiLocationLevelData);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync(filePath);
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Natural Forest Coverage (HA) (Beta),Natural Forest Loss (ha) (Beta),Negligible Risk (%)',
      'kgTestCG3 927 all,L1,Brazil,Amazonas,Lábrea,742.2,8.74,100',
      'kgTestCG3 927 all,L3,Brazil,Acre,Porto Acre,251.69,90.35,100',
      'kgTestCG3 927 all,L2,Brazil,Amazonas,Lábrea,419.68,13.77,100',
      '',
    ]);
  });

  test('When receive an empty input array', async () => {
    afiFileService.process([]);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Natural Forest Coverage (HA) (Beta),Natural Forest Loss (ha) (Beta),Negligible Risk (%)',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    afiFileService.process(undefined);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Natural Forest Coverage (HA) (Beta),Natural Forest Loss (ha) (Beta),Negligible Risk (%)',
      '',
    ]);
  });

  test('When the input is incomplete rows', async () => {
    const newAfiData = afiLocationLevelData.map((data) =>
      Object.entries(data).reduce((acc, curr) => {
        const [key, value] = curr;
        if (key !== 'coverageHA' && key !== 'naturalForestLossHA') {
          acc[key] = value;
        }
        return acc;
      }, {})
    ) as AfiAnalysisByListId[];
    afiFileService.process(newAfiData);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Natural Forest Coverage (HA) (Beta),Natural Forest Loss (ha) (Beta),Negligible Risk (%)',
      'kgTestCG3 927 all,L1,Brazil,Amazonas,Lábrea,,,100',
      'kgTestCG3 927 all,L3,Brazil,Acre,Porto Acre,,,100',
      'kgTestCG3 927 all,L2,Brazil,Amazonas,Lábrea,,,100',
      '',
    ]);
  });
});

describe('AFI File Service - [List level]', () => {
  const afiFileService = new AfiFileService();
  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
  };
  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_deforestation_kpis_aggregated.csv`;

  beforeAll(() => {
    afiFileService.startEmail = jest.fn();
    afiFileService.errorEmail = jest.fn();
    afiFileService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    afiFileService.start(filters, 'deforestation_kpis_aggregated');
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When the input data is ok', async () => {
    afiFileService.process(afiListLevelData);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Natural Forest Coverage (HA) (Beta),Natural Forest Loss (ha) (Beta),Negligible Risk',
      'kgTestCG3 927 all,Brazil,Acre,Porto Acre,176.83,57.55,yes',
      'kgTestCG3 927 all,Brazil,Amazonas,Boca do Acre,74.86,32.8,yes',
      'kgTestCG3 927 all,Brazil,Amazonas,Lábrea,1161.89,22.51,yes',
      '',
    ]);
  });

  test('When receive an empty input array', async () => {
    afiFileService.process([]);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Natural Forest Coverage (HA) (Beta),Natural Forest Loss (ha) (Beta),Negligible Risk',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    afiFileService.process(undefined);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Natural Forest Coverage (HA) (Beta),Natural Forest Loss (ha) (Beta),Negligible Risk',
      '',
    ]);
  });

  test('When the input is incomplete rows', async () => {
    const newAfiData = afiListLevelData.map((data) =>
      Object.entries(data).reduce((acc, curr) => {
        const [key, value] = curr;
        if (key !== 'coverageHA' && key !== 'naturalForestLossHA') {
          acc[key] = value;
        }
        return acc;
      }, {})
    ) as AfiAnalysisByListId[];

    afiFileService.process(newAfiData);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Natural Forest Coverage (HA) (Beta),Natural Forest Loss (ha) (Beta),Negligible Risk',
      'kgTestCG3 927 all,Brazil,Acre,Porto Acre,,,yes',
      'kgTestCG3 927 all,Brazil,Amazonas,Boca do Acre,,,yes',
      'kgTestCG3 927 all,Brazil,Amazonas,Lábrea,,,yes',
      '',
    ]);
  });
});
