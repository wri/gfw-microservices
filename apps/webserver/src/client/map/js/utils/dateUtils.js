import { getYear, differenceInDays, parse, format } from 'date-fns';

/**
 * Converts a date to Julian date format (YYDDD)
 * where YY is the two-digit year and DDD is the day of year (001-366)
 *
 * @param {Date} date - The date to convert
 * @returns {string} Julian date in YYDDD format
 *
 * @example
 * getJulianDate(new Date('2025-01-01')) // returns '25001'
 * getJulianDate(new Date('2025-12-31')) // returns '25365'
 */
export function getJulianDate(date) {
  const year = getYear(date);
  const startOfYear = parse(`${year}/01/01`, 'yyyy/MM/dd', new Date());
  const daysPassed = differenceInDays(date, startOfYear);
  const daysPassedFormatted = daysPassed.toString().padStart(3, '0');

  return `${format(date, 'yy')}${daysPassedFormatted}`;
}
