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

  test('When input data has 3 locations', async () => {
    argentinaOverlap.process(argentinaLocationData, filters);

    await argentinaOverlap.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Data Layer,Sub-Layer,Overlap with Sub-layer (Ha),Overlap with Sub-Layer (%)',
      'WRI,arg3 landmark,Argentina OTBN,Category II,32.8851,100',
      'WRI,arg3 landmark,Argentina Indigenous Territories,,313.0648,100.00153325241168',
      'WRI,arg4 wdpa,Argentina OTBN,Category I,1921.3536,100',
      'WRI,arg4 wdpa,Argentina Protected Areas,Category Ia,1620.7222,91.15570088223583',
      'WRI,arg4 wdpa,Argentina Protected Areas,Category II,156.9743,8.8288433002265',
      'WRI,arg4 wdpa,Argentina Protected Areas,Category VI,0.2748,0.015455817537662165',
      'WRI,arg4 wdpa,Argentina Indigenous Territories,,909.8068,18.10485133954601',
      'WRI,arg5,Argentina OTBN,Category I,114.319,22.492113328818604',
      'WRI,arg5,Argentina OTBN,Category II,98.4859,19.37697166779535',
      'WRI,arg5,Argentina OTBN,Category III,98.4859,19.37697166779535',
      'WRI,arg5,Argentina OTBN,Category IV,98.4859,19.37697166779535',
      'WRI,arg5,Argentina OTBN,Other,98.4859,19.37697166779535',
      'WRI,arg6 otbn,Argentina OTBN,Category I,452.4914,71.05026057491352',
      'WRI,arg6 otbn,Argentina OTBN,Category II,184.3696,28.94973942508648',
      '',
    ]);
  });
});
