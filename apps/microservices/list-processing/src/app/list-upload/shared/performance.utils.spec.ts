import { formatDurationStr, formatHeapUsed } from './performance.utils';

describe('Performance Utils', () => {
  describe('formatDurationStr', () => {
    it('should format duration in milliseconds when less than 1 second', () => {
      const start = 1000;
      const end = 1500;
      expect(formatDurationStr(start, end)).toBe('500.00ms');
    });

    it('should format duration in seconds when less than 1 minute', () => {
      const start = 1000;
      const end = 35000;
      expect(formatDurationStr(start, end)).toBe('34.00s');
    });

    it('should format duration in minutes when greater than 1 minute', () => {
      const start = 1000;
      const end = 121000;
      expect(formatDurationStr(start, end)).toBe('2.00min');
    });
  });

  describe('formatHeapUsed', () => {
    it('should format bytes correctly', () => {
      expect(formatHeapUsed(500)).toBe('500.00 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatHeapUsed(1500)).toBe('1.46 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatHeapUsed(1500000)).toBe('1.43 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatHeapUsed(1500000000)).toBe('1.40 GB');
    });

    it('should handle zero bytes', () => {
      expect(formatHeapUsed(0)).toBe('0.00 B');
    });
  });
});
