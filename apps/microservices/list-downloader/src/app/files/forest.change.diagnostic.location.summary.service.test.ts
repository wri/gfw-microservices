import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';
import { locationListData } from '../shared/mock.data';
import { ForestChangeDiagnosticLocationSummaryService } from './forest.change.diagnostic.location.summary.service';

describe('Forest Change Diagnostic Location Summary Service', () => {
  const forestChangeDiagnosticLocationSummaryService =
    new ForestChangeDiagnosticLocationSummaryService();

  const filters = {
    listId: 5462,
    key: 'tmp-key',
    listView: 'forest_change',
    type: 'forestChangeDiagnosticLocationSummary',
    listName: 'WRI',
    selectedLocationsList: [],
  };

  beforeAll(() => {
    forestChangeDiagnosticLocationSummaryService.startEmail = jest.fn();
    forestChangeDiagnosticLocationSummaryService.errorEmail = jest.fn();
    forestChangeDiagnosticLocationSummaryService.finishedEmail = jest.fn();
  });

  beforeEach(() => {
    forestChangeDiagnosticLocationSummaryService.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(`/tmp/${filters.key}_forest_change_diagnostic_location_summary.csv`);
  });

  test('When input data has 3 locations', async () => {
    forestChangeDiagnosticLocationSummaryService.process(locationListData, filters);

    await forestChangeDiagnosticLocationSummaryService.finish(filters);

    const csvData = fs.readFileSync(
      `/tmp/${filters.key}_forest_change_diagnostic_location_summary.csv`,
      'utf8'
    );
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,State(s),Country (Countries),Tree Cover Extent (%) (HISTORIC SITE CHARACTERISTICS),Tree Cover Extent (ha) (HISTORIC SITE CHARACTERISTICS),Primary Forest (%) (HISTORIC SITE CHARACTERISTICS),Primary Forest (ha) (HISTORIC SITE CHARACTERISTICS),Protected Area (%) (HISTORIC SITE CHARACTERISTICS),Protected Area (ha) (HISTORIC SITE CHARACTERISTICS),Peat (%) (HISTORIC SITE CHARACTERISTICS),Peat (ha) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (%) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (ha) (HISTORIC SITE CHARACTERISTICS),Volume,Company ID,Refinery Name,Supplier Name,Second Refinery Name,Second Supplier Name,Total Hectares',
      'WRI,L1,Amazonas,Brazil,95.93,1205.07,80.07,1005.87,0.00,0.00,1.63,20.53,0.00,0.00,0,,,,,,1256.1647',
      'WRI,L2,Amazonas,Brazil,94.97,1193.00,88.87,1116.40,0.00,0.00,0.00,0.00,0.00,0.00,0,,,,,,1256.2173',
      'WRI,L3,Acre,Brazil,97.93,1230.45,88.74,1114.90,0.00,0.00,0.00,0.00,0.00,0.00,0,,,,,,1256.4204',
      '',
    ]);
  });
});
