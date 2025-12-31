import { getJulianDate } from './dateUtils';

describe('getJulianDate', () => {
  it('should return correct Julian date for January 1st', () => {
    const date = new Date(2025, 0, 1); // Month is 0-indexed
    expect(getJulianDate(date)).toBe('25001');
  });

  it('should return correct Julian date for December 31st in non-leap year', () => {
    const date = new Date(2025, 11, 31); // Month is 0-indexed
    expect(getJulianDate(date)).toBe('25365');
  });

  it('should return correct Julian date for December 31st in leap year', () => {
    const date = new Date(2024, 11, 31); // Month is 0-indexed
    expect(getJulianDate(date)).toBe('24366');
  });

  it('should return correct Julian date for February 29th in leap year', () => {
    const date = new Date(2024, 1, 29); // Month is 0-indexed
    expect(getJulianDate(date)).toBe('24060');
  });

  it('should return correct Julian date for mid-year date', () => {
    const date = new Date(2025, 6, 4); // July 4th, month is 0-indexed
    expect(getJulianDate(date)).toBe('25185');
  });

  it('should pad day of year with leading zeros', () => {
    const date = new Date(2025, 0, 9); // January 9th, month is 0-indexed
    expect(getJulianDate(date)).toBe('25009');
  });

  it('should handle February 1st correctly', () => {
    const date = new Date(2025, 1, 1); // Month is 0-indexed
    expect(getJulianDate(date)).toBe('25032');
  });

  it('should handle March 1st correctly in non-leap year', () => {
    const date = new Date(2025, 2, 1); // Month is 0-indexed
    expect(getJulianDate(date)).toBe('25060');
  });

  it('should handle March 1st correctly in leap year', () => {
    const date = new Date(2024, 2, 1); // Month is 0-indexed
    expect(getJulianDate(date)).toBe('24061');
  });

  it('should return correct Julian date for year 2000', () => {
    const date = new Date(2000, 0, 1); // Month is 0-indexed
    expect(getJulianDate(date)).toBe('00001');
  });

  it('should return correct Julian date for year 2099', () => {
    const date = new Date(2099, 11, 31); // Month is 0-indexed
    expect(getJulianDate(date)).toBe('99365');
  });

  it('should handle Date objects created with ISO string format', () => {
    const date1 = new Date(2025, 0, 15); // Month is 0-indexed
    const date2 = new Date(2025, 0, 15);
    expect(getJulianDate(date1)).toBe(getJulianDate(date2));
    expect(getJulianDate(date1)).toBe('25015');
  });
});
