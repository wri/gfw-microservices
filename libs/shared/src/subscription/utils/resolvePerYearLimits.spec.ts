import { resolvePerYearLimits } from './resolvePerYearLimits';

describe('resolvePerYearLimits', () => {
  it('returns empty array when no raw limits', () => {
    const result = resolvePerYearLimits([], new Date('2022-06-15'));
    expect(result).toEqual([]);
  });

  it('maps a single limit to all contract years up to now', () => {
    const renewalDate = new Date('2023-01-01');
    const rawLimits = [
      {
        MaxAreaAnalyzeablePerYear: 200000000,
        MaxAreaPerList: 50000000,
        OrgType: 2,
        max_locations_per_year: 2000,
        tokens_per_year: 5000,
        update_time: '2022-06-01',
      },
    ];

    const result = resolvePerYearLimits(rawLimits, renewalDate);

    // Should have at least year 0 (2023) up to current
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].year).toBe(0);
    expect(result[0].MaxAreaAnalyzeablePerYear).toBe(200000000);
    expect(result[0].tokens_per_year).toBe(5000);
  });

  it('uses carry-forward: newest limit with update_time <= period start', () => {
    const renewalDate = new Date('2022-01-01');
    const rawLimits = [
      {
        MaxAreaAnalyzeablePerYear: 100000000,
        MaxAreaPerList: 25000000,
        OrgType: 2,
        max_locations_per_year: 1000,
        tokens_per_year: 3000,
        update_time: '2021-06-01',
      },
      {
        MaxAreaAnalyzeablePerYear: 200000000,
        MaxAreaPerList: 50000000,
        OrgType: 2,
        max_locations_per_year: 2000,
        tokens_per_year: 5000,
        update_time: '2023-06-01',
      },
    ];

    const result = resolvePerYearLimits(rawLimits, renewalDate);

    // Year 0 (2022-01-01): newest limit <= 2022-01-01 is the first one (2021-06-01)
    expect(result[0].year).toBe(0);
    expect(result[0].MaxAreaAnalyzeablePerYear).toBe(100000000);
    expect(result[0].tokens_per_year).toBe(3000);

    // Year 1 (2023-01-01): newest limit <= 2023-01-01 is still the first one (2023-06-01 is after)
    expect(result[1].year).toBe(1);
    expect(result[1].MaxAreaAnalyzeablePerYear).toBe(100000000);

    // Year 2 (2024-01-01): newest limit <= 2024-01-01 is the second one (2023-06-01)
    expect(result[2].year).toBe(2);
    expect(result[2].MaxAreaAnalyzeablePerYear).toBe(200000000);
    expect(result[2].tokens_per_year).toBe(5000);
  });

  it('uses earliest limit when renewal is before any limit was created', () => {
    const renewalDate = new Date('2020-01-01');
    const rawLimits = [
      {
        MaxAreaAnalyzeablePerYear: 200000000,
        MaxAreaPerList: 50000000,
        OrgType: 2,
        max_locations_per_year: 2000,
        tokens_per_year: 5000,
        update_time: '2022-01-01',
      },
    ];

    const result = resolvePerYearLimits(rawLimits, renewalDate);

    // Year 0 has no limit <= 2020-01-01, so falls back to earliest
    expect(result[0].year).toBe(0);
    expect(result[0].MaxAreaAnalyzeablePerYear).toBe(200000000);
  });
});
