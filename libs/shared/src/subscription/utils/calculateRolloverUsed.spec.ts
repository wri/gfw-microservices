import { calculateRolloverUsed, RolloverAnalysisAmounts } from './calculateRolloverUsed';
import { differenceInCalendarDays } from 'date-fns';

describe('calculateRolloverUsed', () => {
  test('adds all amounts except current year to rollover', () => {
    const renewalMoment = new Date('2020-01-01');
    const now = new Date();
    const currentYear = Math.floor(differenceInCalendarDays(now, renewalMoment) / 365.25);
    const yearlyUsageSinceActivation = [
      {
        years_since_activation: 1,
        totalAreaPerLocationsAnalyzedYearly: 2000000000,
        totalLocationsYearly: 25000,
        totalTokensYearly: 8000,
      },
      {
        years_since_activation: 2,
        totalAreaPerLocationsAnalyzedYearly: 10000000,
        totalLocationsYearly: 500,
        totalTokensYearly: 3000,
      },
      {
        years_since_activation: currentYear,
        totalAreaPerLocationsAnalyzedYearly: 100000,
        totalLocationsYearly: 50,
        totalTokensYearly: 100,
      },
    ];

    const subscriptionLimits = [{
      MaxAreaAnalyzeablePerYear: 200000000,
      max_locations_per_year: 1000,
      tokens_per_year: 5000,
      year: 0,
    }];

    const result: RolloverAnalysisAmounts = calculateRolloverUsed(
      yearlyUsageSinceActivation,
      subscriptionLimits,
      renewalMoment
    );

    expect(result.rolloverAnalysisAreaUsed).toBe(1800000000);
    expect(result.rolloverLocationsUsed).toBe(24000);
    // year 1: 8000 - 5000 = 3000, year 2: 3000 - 5000 = 0 (no excess), current year skipped
    expect(result.rolloverTokensUsed).toBe(3000);
  });
});
