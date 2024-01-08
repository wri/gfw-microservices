import { calculateAccountUsagePercentage } from './calculateAccountUsagePercentage';

describe('calculateAccountUsagePercentage', () => {
  test('returns 0 when accountUsage or accountLimit is 0', () => {
    expect(calculateAccountUsagePercentage(0, 100)).toBe(0);
    expect(calculateAccountUsagePercentage(50, 0)).toBe(0);
    expect(calculateAccountUsagePercentage(0, 0)).toBe(0);
  });

  test('calculates the correct usage percentage', () => {
    expect(calculateAccountUsagePercentage(50, 100)).toBe(50);
    expect(calculateAccountUsagePercentage(75, 150)).toBe(50);
    expect(calculateAccountUsagePercentage(200, 150)).toBe(100);
  });

  test('does not exceed 100%', () => {
    expect(calculateAccountUsagePercentage(80, 50)).toBe(100);
    expect(calculateAccountUsagePercentage(120, 100)).toBe(100);
  });
});
