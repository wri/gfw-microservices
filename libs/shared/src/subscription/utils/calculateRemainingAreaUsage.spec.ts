import { calculateRemainingAreaUsage } from './calculateRemainingAreaUsage';
import { AnalysisLimit, OrganizationAnalysisUsage } from '@wri-monorepos/sql';

describe('calculateRemainingAreaUsage', () => {
  test('calculates remaining analyzable area correctly', () => {
    const accountLimits: AnalysisLimit = {
      MaxAreaAnalyzeablePerYear: 1000,
      MaxAreaPerList: 500,
      OrgID: 1,
      OrgType: 2,
      organization_name: 'SampleOrg',
      status_name: 'Active',
      max_locations_per_year: 200,
    };

    const accountUsage: OrganizationAnalysisUsage = {
      total_area_analyzed: 300,
      max_area_analyzed: 500,
      number_of_lists_analyzed: 2,
      locations_analyzed: 100,
      organization_id: 1,
      organization_name: 'SampleOrg',
      list_id: 3,
    };

    const remainingArea = calculateRemainingAreaUsage(accountLimits, accountUsage);

    expect(remainingArea).toBe(700); // 1000 - 300
  });

  test('handles null locations_analyzed', () => {
    const accountLimits: AnalysisLimit = {
      MaxAreaAnalyzeablePerYear: 1000,
      MaxAreaPerList: 500,
    };

    const accountUsage: OrganizationAnalysisUsage = {
      total_area_analyzed: 300,
      max_area_analyzed: 500,
      number_of_lists_analyzed: 2,
      locations_analyzed: null,
      organization_id: 1,
      organization_name: 'SampleOrg',
    };

    const remainingArea = calculateRemainingAreaUsage(accountLimits, accountUsage);

    expect(remainingArea).toBe(700); // 1000 - 300
  });
});
