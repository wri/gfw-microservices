import { ResultService } from './result.service';
import { locationListData, commodityRiskData } from '../shared/mock.data';
import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';

describe('Result Service', () => {
  const resultService = new ResultService();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-result',
    listView: 'forest_change',
    templateId: 13,
    combinedColumnsSplitted: [],
    selectedLocationsList: [],
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_result.csv`;

  beforeAll(() => {
    resultService.startEmail = jest.fn();
    resultService.errorEmail = jest.fn();
    resultService.finishedEmail = jest.fn();
    resultService.uploadFileToS3 = jest.fn();

    createDirectory(dir);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  afterAll(() => {
    fs.rmdirSync(dir);
  });

  test('When the list view is commodity risk', async () => {
    resultService.start({ ...filters, listView: 'commodity_risk' });

    const input = commodityRiskData.map((x) => {
      return { ...x, 'List Name': 'test' };
    });
    resultService.process(input);

    await resultService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Country(Countries),Mill Priority,THREATS - Deforestation,THREATS - Peat,THREATS - Protected Areas,THREATS - Fire,THREATS - Overall,VALUES - Forest,VALUES - Peat,VALUES - Protected Areas,VALUES - Overall',
      'WRI,id_1043,Malaysia,Medium,Low,High,Medium,Low,Medium,High,High,Medium,High',
      'WRI,id_1049,Indonesia,High,Medium,High,High,Medium,High,Low,High,High,High',
      'WRI,id_1071,Malaysia,Medium,Low,High,Low,Medium,Medium,Low,High,Low,Medium',
      'WRI,id_1072,Malaysia,Medium,Low,High,Low,Low,Medium,Low,High,Low,Medium',
      '',
    ]);
  }, 70000);

  test('When the list view is forest change', async () => {
    resultService.start(filters);

    const input = locationListData.map((x) => {
      return { ...x, 'List Name': 'test' };
    });
    resultService.process(input);

    await resultService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Size,Commodity,Country(Countries),State(s),Sub-state(s),Tree Cover Extent,Total,Protected Areas,Primary Forests',
      'WRI,L1,1256.16,Cocoa,Brazil,Amazonas,Lábrea,1205.07,22252.13,0,272.82',
      'WRI,L2,1256.22,Cocoa,Brazil,Amazonas,Lábrea,1193,816.15,0,764.27',
      'WRI,L3,1256.42,Cocoa,Brazil,Acre,Porto Acre,1230.45,1059.55,0,995.54',
      '',
    ]);
  }, 70000);
});
