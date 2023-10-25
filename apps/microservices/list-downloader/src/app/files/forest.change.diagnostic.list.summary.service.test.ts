import { describe, expect, test } from '@jest/globals';
import * as fs from 'fs';
import { locationListData } from '../shared/mock.data';
import { ForestChangeDiagnosticListSummaryService } from './forest.change.diagnostic.list.summary.service';
import { createDirectory } from '../shared/file.utils';

describe('Forest Change Diagnostic List Summary Service', () => {
  const forestChangeDiagnosticListSummaryService = new ForestChangeDiagnosticListSummaryService();

  const filters = {
    listId: 5462,
    key: 'tmp-key',
    listView: 'forest_change',
    type: 'forestChangeDiagnosticListSummary',
    listName: 'WRI',
    selectedLocationsList: [],
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_forest_change_diagnostic_list_summary.csv`;

  beforeAll(() => {
    forestChangeDiagnosticListSummaryService.startEmail = jest.fn();
    forestChangeDiagnosticListSummaryService.errorEmail = jest.fn();
    forestChangeDiagnosticListSummaryService.finishedEmail = jest.fn();
    forestChangeDiagnosticListSummaryService.uploadToS3 = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    forestChangeDiagnosticListSummaryService.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When input data has 3 locations', async () => {
    forestChangeDiagnosticListSummaryService.process(locationListData, filters);

    await forestChangeDiagnosticListSummaryService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Country (Countries),Tree Cover Extent (%) (HISTORIC SITE CHARACTERISTICS),Tree Cover Extent (ha) (HISTORIC SITE CHARACTERISTICS),Primary Forest (%) (HISTORIC SITE CHARACTERISTICS),Primary Forest (ha) (HISTORIC SITE CHARACTERISTICS),Protected Area (%) (HISTORIC SITE CHARACTERISTICS),Protected Area (ha) (HISTORIC SITE CHARACTERISTICS),Peat (%) (HISTORIC SITE CHARACTERISTICS),Peat (ha) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (%) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (ha) (HISTORIC SITE CHARACTERISTICS),Total Hectares',
      'WRI,Brazil,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00',
      '',
    ]);
  });
});
