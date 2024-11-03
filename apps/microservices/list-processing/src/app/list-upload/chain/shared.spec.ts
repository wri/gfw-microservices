import { getDurationAsString } from './shared'; // Adjust the import path as necessary

describe('getDurationAsString', () => {
  it('should return an empty string for negative durations', () => {
    const start = 1000;
    const end = 500;
    const result = getDurationAsString(start, end);
    expect(result).toBe('');
  });

  it('should return duration in milliseconds if less than 1000ms', () => {
    const start = 0;
    const end = 500;
    const result = getDurationAsString(start, end);
    expect(result).toBe('500.00ms');
  });

  it('should return duration in seconds if between 1000ms and 60000ms', () => {
    const start = 0;
    const end = 1500;
    const result = getDurationAsString(start, end);
    expect(result).toBe('1.50s');
  });

  it('should return duration in minutes if 60000ms or more', () => {
    const start = 0;
    const end = 120000;
    const result = getDurationAsString(start, end);
    expect(result).toBe('2.00min');
  });

  it('should handle zero duration correctly', () => {
    const start = 1000;
    const end = 1000;
    const result = getDurationAsString(start, end);
    expect(result).toBe('0.00ms');
  });
});
