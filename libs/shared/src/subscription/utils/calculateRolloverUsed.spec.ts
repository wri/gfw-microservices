import { calculateRolloverUsed, RolloverAnalysisAmounts } from './calculateRolloverUsed';
import moment = require('moment');

describe('calculateRolloverUsed', () => {
  test('adds all amounts except current year to rollover', () => {
    const renewalMoment = moment('2020-01-01');
    const now = moment();
    const currentYear = Math.floor(moment.duration(now.diff(renewalMoment)).asYears());
    const yearlyUsageSinceActivation = [
      {
        years_since_activation: 1,
        totalAreaPerLocationsAnalyzedYearly: 2000000000,
        totalLocationsYearly: 25000,
      },
      {
        years_since_activation: 2,
        totalAreaPerLocationsAnalyzedYearly: 10000000,
        totalLocationsYearly: 500,
      },
      {
        years_since_activation: currentYear,
        totalAreaPerLocationsAnalyzedYearly: 100000,
        totalLocationsYearly: 50,
      },
    ];

    const subscriptionLimits = {
      MaxAreaAnalyzeablePerYear: 200000000,
      max_locations_per_year: 1000,
    };

    const result: RolloverAnalysisAmounts = calculateRolloverUsed(
      yearlyUsageSinceActivation,
      subscriptionLimits,
      renewalMoment
    );

    expect(result.rolloverAnalysisAreaUsed).toBe(1800000000);
    expect(result.rolloverLocationsUsed).toBe(24000);
  });
});
