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
      'WRI,id_1174,Malaysia,Medium,Low,High,Low,Low,Medium,Low,High,Low,Medium',
      'WRI,id_120,Malaysia,Medium,Low,High,High,Low,High,Low,Medium,Medium,Medium',
      'WRI,id_1204,Malaysia,Medium,Low,High,Low,Medium,Medium,Low,High,Low,Medium',
      'WRI,id_1356,Thailand,Low,Medium,Low,Low,Low,Medium,Low,Low,Medium,Low',
      'WRI,id_1388,Thailand,Low,Medium,Low,Low,Low,Medium,Low,Medium,Low,Low',
      'WRI,id_1389,Thailand,Low,Medium,Low,Low,Low,Medium,Low,Medium,Medium,Low',
      'WRI,id_1394,Thailand,Low,High,Low,Medium,Low,Medium,Low,Low,Medium,Low',
      'WRI,id_1403,Thailand,Low,Medium,Low,Low,Low,Medium,Medium,Medium,Low,Low',
      'WRI,id_1425,Indonesia,Low,Low,Medium,Low,Low,Low,Low,Medium,Low,Low',
      'WRI,id_1491,Sri Lanka,Low,Low,Low,Medium,Low,Low,Medium,Low,High,Medium',
      'WRI,id_154,Malaysia,Medium,Low,Medium,High,Low,Medium,Low,Medium,High,Medium',
      'WRI,id_1637,Malaysia,Medium,Medium,Medium,Low,Low,Medium,Medium,High,Low,Medium',
      'WRI,id_180,Malaysia,Medium,Medium,Low,High,Low,Medium,High,Low,High,High',
      'WRI,id_296,Indonesia,Low,Low,Low,Low,Low,Low,Low,Low,Low,Low',
      'WRI,id_308,Indonesia,Medium,Medium,High,Low,Low,Medium,Low,High,Low,Medium',
      'WRI,id_323,Indonesia,Low,Low,Medium,Low,Medium,Low,Low,Medium,Low,Low',
      'WRI,id_363,Indonesia,High,High,Medium,Medium,Medium,Medium,Low,High,Medium,Medium',
      'WRI,id_436,Indonesia,Low,Medium,Low,Low,Medium,Medium,Low,Low,Low,Low',
      'WRI,id_437,Indonesia,Low,Medium,Low,Low,Medium,Medium,Low,Low,Low,Low',
      'WRI,id_501,Indonesia,Low,High,Low,Low,Medium,Medium,Medium,Low,Low,Low',
      'WRI,id_565,Indonesia,Low,High,Low,Low,Medium,Medium,Low,Low,Low,Low',
      'WRI,id_619,Malaysia,Medium,Low,High,Low,Medium,Medium,Low,High,Low,Medium',
      'WRI,id_723,Malaysia,Low,Medium,Medium,Low,Low,Low,High,Medium,Medium,Medium',
      'WRI,id_822,Malaysia,Low,Low,Medium,High,Low,Medium,Low,Medium,Medium,Low',
      'WRI,id_950,Indonesia,High,High,High,Medium,High,High,Low,High,Low,Medium',
      'WRI,id_954,Malaysia,Medium,High,High,Low,High,High,Low,High,Low,Medium',
      'WRI,id_955,Indonesia,Medium,Low,High,Medium,Low,Medium,Low,High,Low,Medium',
      'WRI,id_960,Indonesia,Medium,Low,High,Medium,Low,Medium,Low,High,Low,Medium',
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
      'WRI,L1,1256.16,Cocoa,Brazil,Amazonas,Lábrea,1205.07,369.88,0,268.38',
      'WRI,L2,1256.22,Cocoa,Brazil,Amazonas,Lábrea,1193,802.76,0,750.96',
      'WRI,L3,1256.42,Cocoa,Brazil,Acre,Porto Acre,1230.45,1059.55,0,995.54',
      '',
    ]);
  }, 70000);
});
