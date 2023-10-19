import { ResultService } from './result.service';
import { locationListData } from '../shared/mock.data';
import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';

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

  beforeAll(() => {
    resultService.startEmail = jest.fn();
    resultService.errorEmail = jest.fn();
    resultService.finishedEmail = jest.fn();
    resultService.uploadToS3 = jest.fn();
  });

  beforeEach(() => {
    resultService.start(filters);
  });

  test('When input data has 3 locations', async () => {
    const input = locationListData.map((x) => {
      return { ...x, 'List Name': 'test' };
    });
    resultService.process(input);

    await resultService.finish(filters);

    const csvData = fs.readFileSync(`/tmp/${filters.key}.csv`, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Size,Commodity,Country(Countries),State(s),Sub-state(s),Tree Cover Extent,Total,Protected Areas,Primary Forests',
      'WRI,L1,1256.16,Cocoa,Brazil,Amazonas,Lábrea,1205.07,369.88,0,268.38',
      'WRI,L2,1256.22,Cocoa,Brazil,Amazonas,Lábrea,1193,802.76,0,750.96',
      'WRI,L3,1256.42,Cocoa,Brazil,Acre,Porto Acre,1230.45,1059.55,0,995.54',
      '',
    ]);
  });
});
