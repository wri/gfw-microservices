import { describe, expect, test } from '@jest/globals';
import { AfiFileService } from './afi.file.service';
import { afiListLevelData, afiLocationLevelData } from '../shared/mock.data';

import * as fs from 'fs';

describe('AFI File Service - [Location level]', () => {
  const afiFileService = new AfiFileService();

  beforeAll(() => {
    afiFileService.startEmail = jest.fn();
    afiFileService.errorEmail = jest.fn();
    afiFileService.finishedEmail = jest.fn();
  });

  afterEach(() => {
    fs.unlinkSync('/tmp/tmp-key_afi.csv');
  });

  test('When the input data is ok', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-key',
    };
    afiFileService.start(filters);

    afiFileService.process(afiLocationLevelData);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-key_afi.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Coverage (ha),Natural Forest Loss (ha),Negligible Risk (%)',
      'kgTestCG3 927 all,L1,Brazil,Amazonas,Lábrea,742.2031451586759,8.743208131482211,100',
      'kgTestCG3 927 all,L3,Brazil,Acre,Porto Acre,251.69314385190685,90.35210599890917,100',
      'kgTestCG3 927 all,L2,Brazil,Amazonas,Lábrea,419.6845973241104,13.769003244052165,100',
      '',
    ]);
  });

  test('When receive an empty input array', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-key',
    };
    afiFileService.start(filters);

    afiFileService.process([]);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-key_afi.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Coverage (ha),Natural Forest Loss (ha),Negligible Risk (%)',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-key',
    };
    afiFileService.start(filters);

    afiFileService.process(undefined);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-key_afi.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Coverage (ha),Natural Forest Loss (ha),Negligible Risk (%)',
      '',
    ]);
  });

  test('When the input is incomplete rows', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-key',
    };

    afiLocationLevelData.map((data) =>
      Object.entries(data).reduce((acc, curr) => {
        const [key, value] = curr;
        if (key !== 'coverageHA' && key !== 'naturalForestLossHA') {
          acc[key] = value;
        }
        return acc;
      }, {})
    );

    afiFileService.start(filters);

    afiFileService.process(undefined);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-key_afi.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country,State,Sub State,Coverage (ha),Natural Forest Loss (ha),Negligible Risk (%)',
      '',
    ]);
  });
});

describe('AFI File Service - [List level]', () => {
  const afiFileService = new AfiFileService();

  beforeAll(() => {
    afiFileService.startEmail = jest.fn();
    afiFileService.errorEmail = jest.fn();
    afiFileService.finishedEmail = jest.fn();
  });

  afterEach(() => {
    fs.unlinkSync('/tmp/tmp-key_afi_aggregated.csv');
  });

  test('When the input data is ok', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-key',
    };
    afiFileService.start(filters, 'afi_aggregated');

    afiFileService.process(afiListLevelData);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-key_afi_aggregated.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Coverage (ha),Natural Forest Loss (ha),Negligible Risk',
      'kgTestCG3 927 all,Brazil,Acre,Porto Acre,176.82835752141645,57.551127668932544,yes',
      'kgTestCG3 927 all,Brazil,Amazonas,Boca do Acre,74.8647863304904,32.800978329976616,yes',
      'kgTestCG3 927 all,Brazil,Amazonas,Lábrea,1161.887742482786,22.512211375534378,yes',
      '',
    ]);
  });

  test('When receive an empty input array', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-key',
    };
    afiFileService.start(filters, 'afi_aggregated');

    afiFileService.process([]);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-key_afi_aggregated.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Coverage (ha),Natural Forest Loss (ha),Negligible Risk',
      '',
    ]);
  });

  test('When the input is undefined', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-key',
    };
    afiFileService.start(filters, 'afi_aggregated');

    afiFileService.process(undefined);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-key_afi_aggregated.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Coverage (ha),Natural Forest Loss (ha),Negligible Risk',
      '',
    ]);
  });

  test('When the input is incomplete rows', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-key',
    };

    afiListLevelData.map((data) =>
      Object.entries(data).reduce((acc, curr) => {
        const [key, value] = curr;
        if (key !== 'coverageHA' && key !== 'naturalForestLossHA') {
          acc[key] = value;
        }
        return acc;
      }, {})
    );

    afiFileService.start(filters, 'afi_aggregated');

    afiFileService.process(undefined);

    await afiFileService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-key_afi_aggregated.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country,State,Sub State,Coverage (ha),Natural Forest Loss (ha),Negligible Risk',
      '',
    ]);
  });
});
