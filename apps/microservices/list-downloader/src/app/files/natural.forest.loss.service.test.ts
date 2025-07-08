import { describe, expect, test } from '@jest/globals';
import { afiListLevelData, afiLocationLevelData } from '../shared/mock.data';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { AfiAnalysisByListId } from '@wri-monorepos/sql';
import { NaturalForestLossService } from './natural.forest.loss.service';

describe('Natural Forest Loss Service - [Location level]', () => {
  const otherKpisService = new NaturalForestLossService();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_natural_forest_loss.csv`;

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
      'List Name,Location Name,Country,State,Sub State,Location Size (HA),Natural Forest Coverage (HA),Natural Forest Loss cumulative (HA),Natural Forest Loss annual (HA),Year,Natural Forest Data Layer',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,742.2,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,742.2,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,742.2,391.91,0,2023,SBTN',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,251.69,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,251.69,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,251.69,391.91,0,2023,SBTN',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,419.68,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,419.68,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,419.68,391.91,0,2023,SBTN',
      '',
    ]);
  });

  test('When receive an empty input array', async () => {
    otherKpisService.process([]);

    await otherKpisService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Location Size (HA),Natural Forest Coverage (HA),Natural Forest Loss cumulative (HA),Natural Forest Loss annual (HA),Year,Natural Forest Data Layer',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    otherKpisService.process(undefined);

    await otherKpisService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');

    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Location Size (HA),Natural Forest Coverage (HA),Natural Forest Loss cumulative (HA),Natural Forest Loss annual (HA),Year,Natural Forest Data Layer',
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
      'List Name,Location Name,Country,State,Sub State,Location Size (HA),Natural Forest Coverage (HA),Natural Forest Loss cumulative (HA),Natural Forest Loss annual (HA),Year,Natural Forest Data Layer',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",L1,Brazil,Amazonas,Lábrea,,,391.91,0,2023,SBTN',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",L3,Brazil,Acre,"Porto Acre",,,391.91,0,2023,SBTN',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",L2,Brazil,Amazonas,Lábrea,,,391.91,0,2023,SBTN',
      '',
    ]);
  });
});

describe('Natural Forest Loss Service - [List level]', () => {
  const naturalForestLossService = new NaturalForestLossService();
  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
  };
  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_natural_forest_loss_aggregated.csv`;

  beforeAll(() => {
    naturalForestLossService.startEmail = jest.fn();
    naturalForestLossService.errorEmail = jest.fn();
    naturalForestLossService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    naturalForestLossService.start(filters, 'list');
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When the input data is ok', async () => {
    naturalForestLossService.process(afiListLevelData);

    await naturalForestLossService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Locations overlap within Sub State (HA),Natural Forest Coverage (HA),Natural Forest Loss cumulative (HA),Natural Forest Loss annual (HA),Year,Natural Forest Data Layer',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,176.83,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,176.83,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,176.83,391.91,0,2023,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,74.86,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,74.86,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,74.86,391.91,0,2023,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,1161.89,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,1161.89,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,1161.89,391.91,0,2023,SBTN',
      '',
    ]);
  });

  test('When receive an empty input array', async () => {
    naturalForestLossService.process([]);

    await naturalForestLossService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Locations overlap within Sub State (HA),Natural Forest Coverage (HA),Natural Forest Loss cumulative (HA),Natural Forest Loss annual (HA),Year,Natural Forest Data Layer',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    naturalForestLossService.process(undefined);

    await naturalForestLossService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Locations overlap within Sub State (HA),Natural Forest Coverage (HA),Natural Forest Loss cumulative (HA),Natural Forest Loss annual (HA),Year,Natural Forest Data Layer',
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

    naturalForestLossService.process(newAfiData);

    await naturalForestLossService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Locations overlap within Sub State (HA),Natural Forest Coverage (HA),Natural Forest Loss cumulative (HA),Natural Forest Loss annual (HA),Year,Natural Forest Data Layer',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",Brazil,Acre,"Porto Acre",,,391.91,0,2023,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,"Boca do Acre",,,391.91,0,2023,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,,348.93,120.82,2021,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,,348.93,228.11,2022,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,,348.93,0,2023,JRC',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,,391.91,148.38,2021,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,,391.91,243.53,2022,SBTN',
      '"kgTestCG3 927 all",Brazil,Amazonas,Lábrea,,,391.91,0,2023,SBTN',
      '',
    ]);
  });
});
