import { calculateListProcessingLimit } from './calculateListProcessingLimit';
import { AnalysisLimit, OrganizationAnalysisUsage } from '@wri-monorepos/sql';

describe('calculateListProcessingLimit', () => {
  it('returns availableAnalyzableAreaRemaining', () => {
    const accountLimits: AnalysisLimit = {
      MaxAreaAnalyzeablePerYear: 1000,
      MaxAreaPerList: 500,
    };

    const accountUsage: OrganizationAnalysisUsage = {
      total_area_analyzed: 300,
      max_area_analyzed: 800,
      number_of_lists_analyzed: 2,
      locations_analyzed: 100,
      organization_id: 1,
      organization_name: 'TestOrg',
    };

    const result = calculateListProcessingLimit(accountLimits, accountUsage);

    // The correct expected value is 700
    expect(result).toBe(700);
  });
});
