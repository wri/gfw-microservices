import { ArgentinaOverlapService } from './argentina.overlap.service';
import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

import { describe, expect, test, jest, beforeAll, beforeEach, afterEach } from '@jest/globals';
import { argentinaListLevelData, argentinaLocationData } from '../shared/mock.data';

import * as fs from 'fs';
import { createDirectory } from '../shared/file.utils';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

describe('Argentina Overlap Service', () => {
  const argentinaOverlap = new ArgentinaOverlapService();

  const filters = {
    listId: 5642,
    listName: 'WRI',
    key: 'tmp-key',
    type: 'argentina',
    listView: 'forest_change',
    selectedLocationsList: [],
    listLevelAnalysis: argentinaListLevelData,
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_argentina_overlap.csv`;
  const fileAggregatePath = `${dir}/${filters.listName}_argentina_overlap_aggregate.csv`;

  const readCsvData = (filePath: string) => {
    const csvData = fs.readFileSync(filePath, 'utf8');
    return csvData.toString().split('\n');
  };

  beforeAll(() => {
    argentinaOverlap.startEmail = jest.fn<() => Promise<void>>(() => Promise.resolve());
    argentinaOverlap.errorEmail = jest.fn<() => Promise<void>>(() => Promise.resolve());
    argentinaOverlap.finishedEmail = jest.fn<
      (filters: ListFieldsFileRequest, location: string) => Promise<void>
    >(() => Promise.resolve());

    createDirectory(dir);
  });

  beforeEach(() => {
    argentinaOverlap.start(filters);
  });

  afterEach(() => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (fs.existsSync(fileAggregatePath)) {
      fs.unlinkSync(fileAggregatePath);
    }
  });

  test('When list is forest_change view, and has 6 locations data', async () => {
    argentinaOverlap.start(filters);
    argentinaOverlap.process(argentinaLocationData, filters);

    await argentinaOverlap.finish(filters);

    let csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Data Layer,Sub-Layer,Overlap with Sub-layer (Ha),Overlap with Sub-Layer (%)',
      'WRI,"arg3 landmark","Argentina OTBN","Category II",32.89,10.5',
      'WRI,"arg3 landmark","Argentina OTBN","""Category I, Category IV""",32.89,10.5',
      'WRI,"arg3 landmark","Argentina OTBN",Non-Overlap,247.29,78.99',
      'WRI,"arg3 landmark","Argentina Protected Areas","Non-overlap with Protected Areas",313.06,100',
      'WRI,"arg3 landmark","Argentina Indigenous Territories",Overlap,313.06,100',
      'WRI,"arg4 wdpa","Argentina OTBN","Category I",1921.35,38.23',
      'WRI,"arg4 wdpa","Argentina OTBN",Non-Overlap,3103.85,61.77',
      'WRI,"arg4 wdpa","Argentina Protected Areas","Category Ia",1620.72,32.25',
      'WRI,"arg4 wdpa","Argentina Protected Areas","Category II",156.97,3.12',
      'WRI,"arg4 wdpa","Argentina Protected Areas","Category VI",0.27,0.01',
      'WRI,"arg4 wdpa","Argentina Protected Areas","Non-overlap with Protected Areas",3247.24,64.62',
      'WRI,"arg4 wdpa","Argentina Indigenous Territories",Overlap,909.81,18.1',
      'WRI,"arg4 wdpa","Argentina Indigenous Territories","Non-overlap with Indigenous Territories",4115.4,81.9',
      'WRI,arg5,"Argentina OTBN","Category II",98.49,31.34',
      'WRI,arg5,"Argentina OTBN","Category III",98.49,31.34',
      'WRI,arg5,"Argentina OTBN","Category IV",98.49,31.34',
      'WRI,arg5,"Argentina OTBN",Other,212.8,67.73',
      'WRI,arg5,"Argentina Protected Areas","Non-overlap with Protected Areas",314.21,100',
      'WRI,arg5,"Argentina Indigenous Territories","Non-overlap with Indigenous Territories",314.21,100',
      'WRI,"arg6 otbn","Argentina OTBN","Category I",452.49,9.01',
      'WRI,"arg6 otbn","Argentina OTBN","Category II",184.37,3.67',
      'WRI,"arg6 otbn","Argentina OTBN",Non-Overlap,4387.33,87.32',
      'WRI,"arg6 otbn","Argentina Protected Areas","Non-overlap with Protected Areas",5024.19,100',
      'WRI,"arg6 otbn","Argentina Indigenous Territories","Non-overlap with Indigenous Territories",5024.19,100',
      'WRI,Brazil1,"Argentina OTBN",Non-Overlap,313.85,100',
      'WRI,Brazil1,"Argentina Protected Areas","Non-overlap with Protected Areas",313.85,100',
      'WRI,Brazil1,"Argentina Indigenous Territories","Non-overlap with Indigenous Territories",313.85,100',
      'WRI,brazil2,"Argentina OTBN",Non-Overlap,314.02,100',
      'WRI,brazil2,"Argentina Protected Areas","Non-overlap with Protected Areas",314.02,100',
      'WRI,brazil2,"Argentina Indigenous Territories","Non-overlap with Indigenous Territories",314.02,100',
      '',
    ]);

    csvData = readCsvData(fileAggregatePath);
    expect(csvData).toStrictEqual([
      'List Name,Data Layer,Sub-Layer,Overlap with Sub-layer (Ha),Overlap with Sub-Layer (%)',
      'WRI,Argentina OTBN,Category I,2488.16,22.01',
      'WRI,Argentina OTBN,Category II,315.74,2.79',
      'WRI,Argentina OTBN,Non-Overlap,8500.63,75.2',
      'WRI,Argentina Protected Areas,Category Ia,1620.72,14.34',
      'WRI,Argentina Protected Areas,Category II,156.97,1.39',
      'WRI,Argentina Protected Areas,"Category VI, Category V",0.27,0',
      'WRI,Argentina Protected Areas,Non-overlap with Protected Areas,9526.57,84.27',
      'WRI,Argentina Indigenous Territories,Overlap,1222.87,10.82',
      'WRI,Argentina Indigenous Territories,Non-overlap with Indigenous Territories,10081.67,89.18',
      '',
    ]);
  });

  test('When listView is NOT forest_change', async () => {
    const localFilters = { ...filters, listView: 'commodity_risk' };
    argentinaOverlap.start(localFilters);
    argentinaOverlap.process(argentinaLocationData, localFilters);

    await argentinaOverlap.finish(localFilters);

    const csvData = readCsvData(filePath);
    expect(csvData).toStrictEqual([
      'List Name,Location Name,Data Layer,Sub-Layer,Overlap with Sub-layer (Ha),Overlap with Sub-Layer (%)',
      '',
    ]);
  });

  test('Does not start the overlap process if analysis is Legacy', () => {
    const filtersMock = { ...filters };
    filtersMock.listLevelAnalysis.country_area = null;

    const dashboardHandleDownloadSpy = jest.spyOn(DashboardHandleDownload.prototype, 'start');
    argentinaOverlap.start(filtersMock);

    expect(dashboardHandleDownloadSpy).not.toHaveBeenCalled();
  });

  test('Does not generate csv if analysis is Legacy', async () => {
    const filtersMock = { ...filters };
    filtersMock.listLevelAnalysis.country_area = null;

    const dashboardHandleDownloadSpy = jest.spyOn(DashboardHandleDownload.prototype, 'finish');

    await argentinaOverlap.finish(filtersMock);

    expect(dashboardHandleDownloadSpy).not.toHaveBeenCalled();
  });
});
