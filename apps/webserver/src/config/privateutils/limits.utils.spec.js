const { calculateRemainingUsage } = require('./limits.utils'); // Update the path accordingly

describe('calculateRemainingUsage', () => {
  it('should calculate remaining usage correctly', () => {
    // Mock input data
    const accountLimits = {
      MaxAreaAnalyzeablePerYear: 10000000,
      MaxAreaPerList: 5000000,
      OrgID: 1,
      OrgType: null,
      organization_name: 'DevCo',
      status_name: null,
    };

    const accountUsage = {
      total_area_analyzed: 3000000,
      max_area_analyzed: 2000000,
      number_of_lists_analyzed: 2,
      organization_id: 1,
      organization_name: 'DevCo',
    };

    const result = calculateRemainingUsage(accountLimits, accountUsage);

    // main
    expect(result).toEqual(7000000);
  });
});
