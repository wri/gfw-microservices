import { describe, expect, test } from '@jest/globals';
import { afiListLevelData, afiLocationLevelData } from '../shared/mock.data';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { AfiAnalysisByListId } from '@wri-monorepos/sql';
import { OtherKpisService } from './other.kpis.service';

describe('Other Metrics File Service - [Location level]', () => {
  const otherKpisService = new OtherKpisService();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_other_metrics.csv`;

  beforeAll(() => {
    otherKpisService.startEmail = jest.fn();
    otherKpisService.errorEmail = jest.fn();
    otherKpisService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    otherKpisService.start(filters, 'location');
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When the input data is ok', async () => {
    otherKpisService.process(afiLocationLevelData);

    await otherKpisService.finish(filters);

    const csvData = fs.readFileSync(filePath);
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Negligible Risk (%),Overlap with WDPA (Ha),Overlap with WDPA (%),Overlap with Indigenous Lands (Ha),Overlap with Indigenous Lands (%)',
      'kgTestCG3 927 all,L1,Brazil,Amazonas,Lábrea,100,,0,,0',
      'kgTestCG3 927 all,L3,Brazil,Acre,Porto Acre,100,,0,,0',
      'kgTestCG3 927 all,L2,Brazil,Amazonas,Lábrea,100,,0,,0',
      '',
    ]);
  });

  test('When receive an empty input array', async () => {
    otherKpisService.process([]);

    await otherKpisService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Negligible Risk (%),Overlap with WDPA (Ha),Overlap with WDPA (%),Overlap with Indigenous Lands (Ha),Overlap with Indigenous Lands (%)',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    otherKpisService.process(undefined);

    await otherKpisService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Negligible Risk (%),Overlap with WDPA (Ha),Overlap with WDPA (%),Overlap with Indigenous Lands (Ha),Overlap with Indigenous Lands (%)',
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
    otherKpisService.process(newAfiData);

    await otherKpisService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Negligible Risk (%),Overlap with WDPA (Ha),Overlap with WDPA (%),Overlap with Indigenous Lands (Ha),Overlap with Indigenous Lands (%)',
      'kgTestCG3 927 all,L1,Brazil,Amazonas,Lábrea,100,,0,,0',
      'kgTestCG3 927 all,L3,Brazil,Acre,Porto Acre,100,,0,,0',
      'kgTestCG3 927 all,L2,Brazil,Amazonas,Lábrea,100,,0,,0',
      '',
    ]);
  });
});

describe('Other Metrics File Service - [List level]', () => {
  const otherKpisService = new OtherKpisService();
  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
  };
  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_other_metrics_aggregated.csv`;

  beforeAll(() => {
    otherKpisService.startEmail = jest.fn();
    otherKpisService.errorEmail = jest.fn();
    otherKpisService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    otherKpisService.start(filters, 'list');
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When the input data is ok', async () => {
    otherKpisService.process(afiListLevelData);

    await otherKpisService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Negligible Risk,Overlap with WDPA (Ha),Overlap with Indigenous Lands (Ha)',
      'kgTestCG3 927 all,Brazil,Acre,Porto Acre,yes,0,0',
      'kgTestCG3 927 all,Brazil,Amazonas,Boca do Acre,yes,0,0',
      'kgTestCG3 927 all,Brazil,Amazonas,Lábrea,yes,0,0',
      '',
    ]);
  });

  test('When receive an empty input array', async () => {
    otherKpisService.process([]);

    await otherKpisService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Negligible Risk,Overlap with WDPA (Ha),Overlap with Indigenous Lands (Ha)',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    otherKpisService.process(undefined);

    await otherKpisService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Negligible Risk,Overlap with WDPA (Ha),Overlap with Indigenous Lands (Ha)',
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

    otherKpisService.process(newAfiData);

    await otherKpisService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Negligible Risk,Overlap with WDPA (Ha),Overlap with Indigenous Lands (Ha)',
      'kgTestCG3 927 all,Brazil,Acre,Porto Acre,yes,0,0',
      'kgTestCG3 927 all,Brazil,Amazonas,Boca do Acre,yes,0,0',
      'kgTestCG3 927 all,Brazil,Amazonas,Lábrea,yes,0,0',
      '',
    ]);
  });
});
