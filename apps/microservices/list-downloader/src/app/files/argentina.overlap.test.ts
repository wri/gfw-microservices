import { ArgentinaOverlap } from './argentina.overlap';
import { describe, expect, test } from '@jest/globals';
import { argentinaLocationData } from '../shared/mock.data';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';

describe('Argentina Overlap', () => {
  const argentinaOverlap = new ArgentinaOverlap();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
    type: 'argentinaOverlap',
    selectedLocationsList: [],
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_argentina_overlap.csv`;

  beforeAll(() => {
    argentinaOverlap.startEmail = jest.fn();
    argentinaOverlap.errorEmail = jest.fn();
    argentinaOverlap.finishedEmail = jest.fn();

    createDirectory(dir);
  });

  beforeEach(() => {
    argentinaOverlap.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When input data has 6 locations', async () => {
    argentinaOverlap.process(argentinaLocationData, filters);

    await argentinaOverlap.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Data Layer,Sub-Layer,Overlap with Sub-layer (Ha),Overlap with Sub-Layer (%)',
      'WRI,arg3 landmark,Argentina OTBN,Category II,32.89,100',
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
  });
});
