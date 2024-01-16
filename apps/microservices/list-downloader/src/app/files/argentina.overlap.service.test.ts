import { ArgentinaOverlapService } from './argentina.overlap.service';
import { describe, expect, test } from '@jest/globals';
import { argentinaListLevelData, argentinaLocationData } from '../shared/mock.data';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';

describe('Argentina Overlap', () => {
  const argentinaOverlapService = new ArgentinaOverlapService();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
    type: 'argentinaOverlap',
    selectedLocationsList: [],
    listLevelAnalysis: argentinaListLevelData,
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_argentina_overlap.csv`;
  const fileAggregatePath = `${dir}/${filters.listName}_argentina_overlap_aggregate.csv`;

  const readCsvData = (filePath) => {
    const csvData = fs.readFileSync(filePath, 'utf8');
    return csvData.toString().split('\n');
  };

  beforeAll(() => {
    argentinaOverlapService.startEmail = jest.fn();
    argentinaOverlapService.errorEmail = jest.fn();
    argentinaOverlapService.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    argentinaOverlapService.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
    fs.unlinkSync(fileAggregatePath);
  });

  test('When input data has 6 locations', async () => {
    argentinaOverlapService.process(argentinaLocationData, filters);

    await argentinaOverlapService.finish(filters);

    let csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Data Layer,Sub-Layer,Overlap with Sub-layer (Ha),Overlap with Sub-Layer (%)',
      'WRI,arg3 landmark,Argentina OTBN,Category II,32.89,50',
      'WRI,arg3 landmark,Argentina OTBN,"Category I, Category IV",32.89,50',
      'WRI,arg3 landmark,Argentina Indigenous Territories,,313.06,100',
      'WRI,arg4 wdpa,Argentina OTBN,Category I,1921.35,100',
      'WRI,arg4 wdpa,Argentina Protected Areas,Category Ia,1620.72,91.16',
      'WRI,arg4 wdpa,Argentina Protected Areas,Category II,156.97,8.83',
      'WRI,arg4 wdpa,Argentina Protected Areas,Category VI,0.27,0.02',
      'WRI,arg4 wdpa,Argentina Indigenous Territories,,909.81,18.1',
      'WRI,arg5,Argentina OTBN,Category I,114.32,22.49',
      'WRI,arg5,Argentina OTBN,Category II,98.49,19.38',
      'WRI,arg5,Argentina OTBN,Category III,98.49,19.38',
      'WRI,arg5,Argentina OTBN,Other,196.97,38.75',
      'WRI,arg6 otbn,Argentina OTBN,Category I,452.49,71.05',
      'WRI,arg6 otbn,Argentina OTBN,Category II,184.37,28.95',
      '',
    ]);

    csvData = readCsvData(fileAggregatePath);
    expect(csvData).toStrictEqual([
      'List Name,Data Layer,Sub-Layer,Overlap with Sub-layer (Ha),Overlap with Sub-Layer (%)',
      'WRI,Argentina OTBN,Category I,2488.16,88.74',
      'WRI,Argentina OTBN,Category II,315.74,11.26',
      'WRI,Argentina Protected Areas,Category Ia,1620.72,91.16',
      'WRI,Argentina Protected Areas,Category II,156.97,8.83',
      'WRI,Argentina Protected Areas,"Category VI, Category V",0.27,0.02',
      'WRI,Argentina Indigenous Territories,,1222.87,10.82',
      '',
    ]);
  });
});
