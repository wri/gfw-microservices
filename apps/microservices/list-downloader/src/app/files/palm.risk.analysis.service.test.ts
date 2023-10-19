import { describe, expect, test } from '@jest/globals';

import * as fs from 'fs';
import { locationListData } from '../shared/mock.data';
import { PalmRiskAnalysisService } from './palm.risk.analysis.service';

describe('Palm Risk Analysis Service', () => {
  const palmRiskAnalysisService = new PalmRiskAnalysisService();

  const filters = {
    listId: 5462,
    key: 'tmp-key',
    listView: 'commodity_risk',
    type: 'palmRiskAnalysis',
    listName: 'WRI',
    selectedLocationsList: [],
  };

  beforeAll(() => {
    palmRiskAnalysisService.startEmail = jest.fn();
    palmRiskAnalysisService.errorEmail = jest.fn();
    palmRiskAnalysisService.finishedEmail = jest.fn();
  });

  afterEach(() => {
    fs.unlinkSync(`/tmp/${filters.key}_palm_risk_analysis.csv`);
  });

  test('When input data has 3 locations', async () => {
    palmRiskAnalysisService.start(filters);

    palmRiskAnalysisService.process(locationListData, filters);

    await palmRiskAnalysisService.finish(filters);

    const csvData = fs.readFileSync(`/tmp/${filters.key}_palm_risk_analysis.csv`, 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      'List Name,Location Name,Mill Priority,Mill Priority Score,Overall Threat,Threat Score,Overall Value,Value Score,Deforestation - Threats Amount,Peat - Threats Amount,Protected Areas - Threats Amount,Fires - Threats Amount,Forest - Values Amount,Peat - Values Amount,Protected Areas - Values Amount,Deforestation - Threats Level,Peat - Threats Level,Protected Areas - Threats Level,Fires - Threats Level,Forest - Values Level,Peat - Values Level,Protected Areas - Values Level',
      'WRI,L2,Medium,3,High,2,Medium,1,55.0759,0,0,4,434.7475,0,0,High,Low,Low,High,High,Low,Low',
      'WRI,L3,Medium,2.2,High,2,Low,0.2,25.9666,0,0,2.5,250.7064,0,0,High,Low,Low,High,Medium,Low,Low',
      '',
    ]);
  });
});
