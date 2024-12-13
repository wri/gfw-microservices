import {
  listStatus,
  listStatusOrderByWorse,
  listStatusDescriptions,
  DIAGNOSTIC_ANALYSIS_PERIOD,
} from '@wri-monorepos/constants';
import * as webserverConstants from './listStatuses.constants';
import {
  latestTreeCoverLossYearCommodityRisk,
  latestTreeCoverLossYearForTclDataInAnalyses,
} from '../../client/common/js/config';

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
  it('Compare webserver and libs latestTreeCoverLossYearCommodityRisk have same value for COMMODITY_RISK_END_YEAR', () => {
    expect(latestTreeCoverLossYearCommodityRisk).toEqual(
      DIAGNOSTIC_ANALYSIS_PERIOD.COMMODITY_RISK_END_YEAR
    );
  });
  it('Compare webserver and libs latestTreeCoverLossYearCommodityRisk have same value for COMMODITY_RISK_END_YEAR', () => {
    expect(latestTreeCoverLossYearForTclDataInAnalyses).toEqual(
      DIAGNOSTIC_ANALYSIS_PERIOD.END_YEAR
    );
  });
});
