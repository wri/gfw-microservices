import { AnalysisLimit } from '@wri-monorepos/sql';
import { combineOrganizationLimits } from './combineOrganizationLimits'; // Update with the correct module path

describe('combineOrganizationLimits', () => {
  it('should combine subscription and extra limits correctly', () => {
    const subscriptionLimits: AnalysisLimit = {
      MaxAreaAnalyzeablePerYear: 100,
      MaxAreaPerList: 50,
      OrgID: 1,
      OrgType: 2,
      organization_name: 'Org1',
      status_name: 'Active',
      max_locations_per_year: 10,
      tokens_per_year: 5000,
    };

    const extraLimits: AnalysisLimit = {
      MaxAreaAnalyzeablePerYear: 50,
      MaxAreaPerList: 30,
      OrgID: 1,
      OrgType: 2,
      organization_name: 'Org1',
      status_name: 'Active',
      max_locations_per_year: 5,
      tokens_per_year: 1000,
    };

    const result = combineOrganizationLimits(subscriptionLimits, extraLimits);

    expect(result.MaxAreaAnalyzeablePerYear).toBe(150); // 100 + 50
    expect(result.max_locations_per_year).toBe(15); // 10 + 5
    expect(result.tokens_per_year).toBe(6000); // 5000 + 1000
  });
});
