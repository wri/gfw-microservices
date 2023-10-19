import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';
import { locationListData } from '../shared/mock.data';
import { MillPriorityService } from './mill.priority.service';

describe('Mill Priority Service', () => {
  const millPriorityService = new MillPriorityService();

  const filters = {
    listId: 5462,
    key: 'tmp-key',
    listView: 'commodity_risk',
    type: 'everything',
    listName: 'WRI',
    selectedLocationsList: [1, 2, 3],
  };

  beforeAll(() => {
    millPriorityService.startEmail = jest.fn();
    millPriorityService.errorEmail = jest.fn();
    millPriorityService.finishedEmail = jest.fn();
  });

  beforeEach(() => {
    millPriorityService.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(`/tmp/${filters.key}_mill_priority_history.csv`);
  });

  test('When input data has 3 locations', async () => {
    millPriorityService.process(locationListData, filters);

    await millPriorityService.finish(filters);

    const csvData = fs.readFileSync(`/tmp/${filters.key}_mill_priority_history.csv`, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Threat + Value,Year',
      'WRI,L1,Medium,2002',
      'WRI,L1,Medium,2003',
      'WRI,L1,Medium,2004',
      'WRI,L1,Medium,2005',
      'WRI,L1,Medium,2006',
      'WRI,L1,Medium,2007',
      'WRI,L1,Medium,2008',
      'WRI,L1,Medium,2009',
      'WRI,L1,Medium,2010',
      'WRI,L1,Medium,2011',
      'WRI,L1,Medium,2012',
      'WRI,L1,Medium,2013',
      'WRI,L1,Low,2014',
      'WRI,L1,Medium,2015',
      'WRI,L1,Medium,2016',
      'WRI,L1,Medium,2017',
      'WRI,L1,Medium,2018',
      'WRI,L1,Low,2019',
      'WRI,L1,Medium,2020',
      'WRI,L2,Medium,2002',
      'WRI,L2,Medium,2003',
      'WRI,L2,Medium,2004',
      'WRI,L2,Medium,2005',
      'WRI,L2,Medium,2006',
      'WRI,L2,Medium,2007',
      'WRI,L2,Medium,2008',
      'WRI,L2,Medium,2009',
      'WRI,L2,Medium,2010',
      'WRI,L2,Medium,2011',
      'WRI,L2,Medium,2012',
      'WRI,L2,Medium,2013',
      'WRI,L2,Medium,2014',
      'WRI,L2,Medium,2015',
      'WRI,L2,Medium,2016',
      'WRI,L2,Medium,2017',
      'WRI,L2,Medium,2018',
      'WRI,L2,Medium,2019',
      'WRI,L2,Medium,2020',
      'WRI,L3,Medium,2002',
      'WRI,L3,Medium,2003',
      'WRI,L3,Medium,2004',
      'WRI,L3,Medium,2005',
      'WRI,L3,Medium,2006',
      'WRI,L3,Medium,2007',
      'WRI,L3,Medium,2008',
      'WRI,L3,Medium,2009',
      'WRI,L3,Medium,2010',
      'WRI,L3,Medium,2011',
      'WRI,L3,Medium,2012',
      'WRI,L3,Medium,2013',
      'WRI,L3,Medium,2014',
      'WRI,L3,Medium,2015',
      'WRI,L3,Medium,2016',
      'WRI,L3,Medium,2017',
      'WRI,L3,Low,2018',
      'WRI,L3,Medium,2019',
      'WRI,L3,Medium,2020',
      '',
    ]);
  });
});
