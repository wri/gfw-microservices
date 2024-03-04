import {
  calculateRolloverUsableAnalysis,
  RolloverAnalysisAmounts,
} from './calculateRolloverUsableAnalysis';

describe('calculateRolloverUsableAnalysis', () => {
  test('calculates rollover amounts correctly', () => {
    const yearlyUsageSinceActivation = [
      {
        totalAreaAnalyzedYearly: 500000000,
        totalAreaPerLocationsAnalyzedYearly: 2000000000,
        totalLocationsYearly: 25000,
      },
      {
        totalAreaAnalyzedYearly: 10000000,
        totalAreaPerLocationsAnalyzedYearly: 10000000,
        totalLocationsYearly: 500,
      },
    ];

    const subscriptionLimits = {
      MaxAreaAnalyzeablePerYear: 200000000,
      MaxAreaPerList: 100000000,
      max_locations_per_year: 1000,
    };

    const result: RolloverAnalysisAmounts = calculateRolloverUsableAnalysis(
      yearlyUsageSinceActivation,
      subscriptionLimits
    );

    // Adjust the expected values based on your calculations
    expect(result.rolloverAreaAnalyzable).toBe(300000000);
    expect(result.rolloverLocations).toBe(24000);
  });
});
