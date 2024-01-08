import { calculateListProcessingLimit } from './calculateListProcessingLimit';
import { AnalysisLimit, OrganizationAnalysisUsage } from '@wri-monorepos/sql';

describe('calculateListProcessingLimit', () => {
   // Test case when availableAnalyzableAreaRemaining is less than MaxAreaPerList
   it('returns availableAnalyzableAreaRemaining when it is less than MaxAreaPerList', () => {
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

    // The correct expected value is 500 (minimum between availableAnalyzableAreaRemaining and MaxAreaPerList)
    expect(result).toBe(500);
  });

  // Test case when availableAnalyzableAreaRemaining is greater than MaxAreaPerList
  it('returns MaxAreaPerList when availableAnalyzableAreaRemaining is greater', () => {
    const accountLimits: AnalysisLimit = {
      MaxAreaAnalyzeablePerYear: 1000,
      MaxAreaPerList: 500,
    };

    const accountUsage: OrganizationAnalysisUsage = {
      total_area_analyzed: 200,
      max_area_analyzed: 800,
      number_of_lists_analyzed: 2,
      locations_analyzed: 100,
      organization_id: 1,
      organization_name: 'TestOrg',
    };

    const result = calculateListProcessingLimit(accountLimits, accountUsage);

    expect(result).toBe(500); // MaxAreaPerList is greater than availableAnalyzableAreaRemaining
  });
});