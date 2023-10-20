import { ResultService } from './result.service';
import { locationListData } from '../shared/mock.data';
import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';

describe('Result Service', () => {
  const resultService = new ResultService();

  const filters = {
    listId: 5642,
    key: 'tmp-result',
    listView: 'forest_change',
    templateId: 13,
    combinedColumnsSplitted: [],
    selectedLocationsList: [],
    listName: 'WRI',
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_result.csv`;

  beforeAll(() => {
    resultService.startEmail = jest.fn();
    resultService.errorEmail = jest.fn();
    resultService.finishedEmail = jest.fn();
    resultService.uploadToS3 = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    resultService.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When input data has 3 locations', async () => {
    const input = locationListData.map((x) => {
      return { ...x, 'List Name': 'test' };
    });
    resultService.process(input);

    await resultService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Size,Commodity,Country(Countries),State(s),Sub-state(s),Tree Cover Extent,Total,Protected Areas,Primary Forests',
      'WRI,L1,1256.1647,Cocoa,Brazil,Amazonas,Lábrea,1205.0714,369.8819,0,268.37989999999996',
      'WRI,L2,1256.2173,Cocoa,Brazil,Amazonas,Lábrea,1193.0049,802.7607999999999,0,750.9584999999998',
      'WRI,L3,1256.4204,Cocoa,Brazil,Acre,Porto Acre,1230.4542,1059.5466000000001,0,995.5422000000001',
      '',
    ]);
  });
});
