import {
  listStatus,
  listStatusOrderByWorse,
  listStatusDescriptions,
  DIAGNOSTIC_ANALYSIS_PERIOD
} from '@wri-monorepos/constants';
import * as webserverConstants from './listStatuses.constants';

describe('Compare webserver and libs listStatus constants', () => {
  it('Compare webserver and libs listStatus', () => {
    expect(webserverConstants.listStatus).toEqual(listStatus);
  });

  it('Compare webserver and libs listStatusOrderByWorse', () => {
    expect(webserverConstants.listStatusOrderByWorse).toEqual(listStatusOrderByWorse);
  });

  it('Compare webserver and libs listStatusOrderByWorse', () => {
    expect(webserverConstants.listStatusDescriptions).toEqual(listStatusDescriptions);
  });
  it('Compare webserver and libs DIAGNOSTIC_ANALYSIS_PERIOD have same value for latestTreeCoverLossYearForTclDataInAnalyses', () => {
    expect(webserverConstants.latestTreeCoverLossYearForTclDataInAnalyses).toEqual(DIAGNOSTIC_ANALYSIS_PERIOD.latestTreeCoverLossYearForTclDataInAnalyses);
  });
  it('Compare webserver and libs DIAGNOSTIC_ANALYSIS_PERIOD have same value for latestTreeCoverLossYearForTclDataInAnalyses', () => {
    expect(webserverConstants.latestTreeCoverLossYearCommodityRisk).toEqual(DIAGNOSTIC_ANALYSIS_PERIOD.latestTreeCoverLossYearCommodityRisk);
  });
});
