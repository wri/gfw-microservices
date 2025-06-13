import { calculateAccountSubscriptionDates } from './accountSubscriptionDates';

describe('calculateAccountSubscriptionDates', () => {
  // Mock the current date to ensure consistent test results
  const mockCurrentDate = '2024-03-15T12:00:00Z';

  beforeEach(() => {
    // Set a fixed date for all tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockCurrentDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should calculate correct dates for a renewal time in the past', () => {
    const renewalTime = '2023-01-01T00:00:00Z';
    const result = calculateAccountSubscriptionDates(renewalTime);

    // The start date should be the beginning of the current subscription year
    expect(result.startDate).toBe('2023-12-31');
    // The end date should be tomorrow (current date + 1 day)
    expect(result.endDate).toBe('2024-03-16');
    // The subscription year end should be one year from the start date
    expect(result.subscriptionYearEnd).toBe('December 31, 2024');
  });

  it('should calculate correct dates for a renewal time in the future', () => {
    const renewalTime = '2024-06-01T00:00:00Z';
    const result = calculateAccountSubscriptionDates(renewalTime);

    // The start date should be the beginning of the previous subscription year
    expect(result.startDate).toBe('2023-05-31');
    // The end date should be tomorrow (current date + 1 day)
    expect(result.endDate).toBe('2024-03-16');
    // The subscription year end should be one year from the start date
    expect(result.subscriptionYearEnd).toBe('May 31, 2024');
  });

  it('should handle renewal time on the same day', () => {
    const renewalTime = '2024-03-15T00:00:00Z';
    const result = calculateAccountSubscriptionDates(renewalTime);

    // The start date should be the beginning of the current subscription year
    expect(result.startDate).toBe('2024-03-14');
    // The end date should be tomorrow (current date + 1 day)
    expect(result.endDate).toBe('2024-03-16');
    // The subscription year end should be one year from the start date
    expect(result.subscriptionYearEnd).toBe('March 14, 2025');
  });

  it('should handle renewal time exactly one year ago', () => {
    const renewalTime = '2023-03-15T00:00:00Z';
    const result = calculateAccountSubscriptionDates(renewalTime);

    // The start date should be the beginning of the current subscription year
    expect(result.startDate).toBe('2024-03-14');
    // The end date should be tomorrow (current date + 1 day)
    expect(result.endDate).toBe('2024-03-16');
    // The subscription year end should be one year from the start date
    expect(result.subscriptionYearEnd).toBe('March 14, 2025');
  });

  it('should handle renewal time with different time zones', () => {
    const renewalTime = '2023-01-01T23:59:59+00:00';
    const result = calculateAccountSubscriptionDates(renewalTime);

    // The start date should be the beginning of the current subscription year
    expect(result.startDate).toBe('2024-01-01');
    // The end date should be tomorrow (current date + 1 day)
    expect(result.endDate).toBe('2024-03-16');
    // The subscription year end should be one year from the start date
    expect(result.subscriptionYearEnd).toBe('January 1, 2025');
  });

  it('should handle Date object input', () => {
    const renewalTime = new Date('2023-01-01T00:00:00Z');
    const result = calculateAccountSubscriptionDates(renewalTime);

    // The start date should be the beginning of the current subscription year
    expect(result.startDate).toBe('2023-12-31');
    // The end date should be tomorrow (current date + 1 day)
    expect(result.endDate).toBe('2024-03-16');
    // The subscription year end should be one year from the start date
    expect(result.subscriptionYearEnd).toBe('December 31, 2024');
  });

  it('should maintain consistent date calculations across multiple calls', () => {
    const renewalTime = '2023-01-01T00:00:00Z';
    const result1 = calculateAccountSubscriptionDates(renewalTime);
    const result2 = calculateAccountSubscriptionDates(renewalTime);

    expect(result1).toEqual(result2);
  });
});
