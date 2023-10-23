import { describe, expect, test } from '@jest/globals';
import { CommodityRiskDiagnosticLocationSummaryService } from './commodity.risk.diagnostic.location.summary.service';
import * as fs from 'fs';
import { locationListData } from '../shared/mock.data';
import { createDirectory } from '../shared/file.utils';

describe('Commodity Risk Diagnostic Location Summary Service', () => {
  const commodityRiskDiagnosticLocationSummaryService =
    new CommodityRiskDiagnosticLocationSummaryService();

  const filters = {
    listId: 5462,
    key: 'tmp-key',
    listView: 'commodity_risk',
    type: 'commodityRiskDiagnosticLocationSummary',
    listName: 'WRI',
    selectedLocationsList: [],
  };

  const dir = `/tmp/wri-${filters.key}`;
  const filePath = `${dir}/${filters.listName}_commodity_risk_diagnostic_location_summary.csv`;

  beforeAll(() => {
    commodityRiskDiagnosticLocationSummaryService.startEmail = jest.fn();
    commodityRiskDiagnosticLocationSummaryService.errorEmail = jest.fn();
    commodityRiskDiagnosticLocationSummaryService.finishedEmail = jest.fn();
    createDirectory(dir);
  });

  beforeEach(() => {
    commodityRiskDiagnosticLocationSummaryService.start(filters);
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  test('When input data has 3 locations', async () => {
    commodityRiskDiagnosticLocationSummaryService.process(locationListData, filters);

    await commodityRiskDiagnosticLocationSummaryService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,State(s),Country (Countries),Tree Cover Extent (%) (HISTORIC SITE CHARACTERISTICS),Tree Cover Extent (ha) (HISTORIC SITE CHARACTERISTICS),Primary Forest (%) (HISTORIC SITE CHARACTERISTICS),Primary Forest (ha) (HISTORIC SITE CHARACTERISTICS),Protected Area (%) (HISTORIC SITE CHARACTERISTICS),Protected Area (ha) (HISTORIC SITE CHARACTERISTICS),Peat (%) (HISTORIC SITE CHARACTERISTICS),Peat (ha) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (%) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (ha) (HISTORIC SITE CHARACTERISTICS),Volume,Company ID,Refinery Name,Supplier Name,Second Refinery Name,Second Supplier Name,Parent Company,Certification,Total Hectares',
      'WRI,L1,Amazonas,Brazil,95.93,1205.07,80.07,1005.87,0.00,0.00,1.63,20.53,0.00,0.00,0,,,,,,,,1256.1647',
      'WRI,L2,Amazonas,Brazil,94.97,1193.00,88.87,1116.40,0.00,0.00,0.00,0.00,0.00,0.00,0,,,,,,,,1256.2173',
      'WRI,L3,Acre,Brazil,97.93,1230.45,88.74,1114.90,0.00,0.00,0.00,0.00,0.00,0.00,0,,,,,,,,1256.4204',
      '',
    ]);
  });

  test('When input is empty array', async () => {
    commodityRiskDiagnosticLocationSummaryService.process([], filters);

    await commodityRiskDiagnosticLocationSummaryService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,State(s),Country (Countries),Tree Cover Extent (%) (HISTORIC SITE CHARACTERISTICS),Tree Cover Extent (ha) (HISTORIC SITE CHARACTERISTICS),Primary Forest (%) (HISTORIC SITE CHARACTERISTICS),Primary Forest (ha) (HISTORIC SITE CHARACTERISTICS),Protected Area (%) (HISTORIC SITE CHARACTERISTICS),Protected Area (ha) (HISTORIC SITE CHARACTERISTICS),Peat (%) (HISTORIC SITE CHARACTERISTICS),Peat (ha) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (%) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (ha) (HISTORIC SITE CHARACTERISTICS),Volume,Company ID,Refinery Name,Supplier Name,Second Refinery Name,Second Supplier Name,Parent Company,Certification,Total Hectares',
      '',
    ]);
  });

  test('When input is undefined', async () => {
    commodityRiskDiagnosticLocationSummaryService.process(undefined, filters);

    await commodityRiskDiagnosticLocationSummaryService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,State(s),Country (Countries),Tree Cover Extent (%) (HISTORIC SITE CHARACTERISTICS),Tree Cover Extent (ha) (HISTORIC SITE CHARACTERISTICS),Primary Forest (%) (HISTORIC SITE CHARACTERISTICS),Primary Forest (ha) (HISTORIC SITE CHARACTERISTICS),Protected Area (%) (HISTORIC SITE CHARACTERISTICS),Protected Area (ha) (HISTORIC SITE CHARACTERISTICS),Peat (%) (HISTORIC SITE CHARACTERISTICS),Peat (ha) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (%) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (ha) (HISTORIC SITE CHARACTERISTICS),Volume,Company ID,Refinery Name,Supplier Name,Second Refinery Name,Second Supplier Name,Parent Company,Certification,Total Hectares',
      '',
    ]);
  });

  test('When you filter by specific locations', async () => {
    const newFilters = {
      ...filters,
      selectedLocationsList: [1],
    };

    commodityRiskDiagnosticLocationSummaryService.start(newFilters);

    commodityRiskDiagnosticLocationSummaryService.process(locationListData, filters);

    await commodityRiskDiagnosticLocationSummaryService.finish(filters);

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,State(s),Country (Countries),Tree Cover Extent (%) (HISTORIC SITE CHARACTERISTICS),Tree Cover Extent (ha) (HISTORIC SITE CHARACTERISTICS),Primary Forest (%) (HISTORIC SITE CHARACTERISTICS),Primary Forest (ha) (HISTORIC SITE CHARACTERISTICS),Protected Area (%) (HISTORIC SITE CHARACTERISTICS),Protected Area (ha) (HISTORIC SITE CHARACTERISTICS),Peat (%) (HISTORIC SITE CHARACTERISTICS),Peat (ha) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (%) (HISTORIC SITE CHARACTERISTICS),Intact Forest Landscape (ha) (HISTORIC SITE CHARACTERISTICS),Volume,Company ID,Refinery Name,Supplier Name,Second Refinery Name,Second Supplier Name,Parent Company,Certification,Total Hectares',
      'WRI,L2,Amazonas,Brazil,94.97,1193.00,88.87,1116.40,0.00,0.00,0.00,0.00,0.00,0.00,0,,,,,,,,1256.2173',
      '',
    ]);
  });
});
