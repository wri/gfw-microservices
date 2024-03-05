import { calculateRolloverUsed, RolloverAnalysisAmounts } from './calculateRolloverUsed';

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

    const result: RolloverAnalysisAmounts = calculateRolloverUsed(
      yearlyUsageSinceActivation,
      subscriptionLimits
    );

    expect(result.rolloverAnalysisAreaUsed).toBe(300000000);
    expect(result.rolloverLocationsUsed).toBe(24000);
  });
});
