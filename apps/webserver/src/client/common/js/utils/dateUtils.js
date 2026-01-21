/**
 * Shared date utility functions
 */

/**
 * Parse a date value and return a Date object or null if invalid
 * @param {Date|string|number} value - The value to parse
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
export const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Format a date value to ISO date string (YYYY-MM-DD) or return empty string if invalid
 * @param {Date|string|number} value - The value to format
 * @returns {string} - ISO date string or empty string if invalid
 */
export const formatDateValue = (value) => {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);
  const timestamp = date.getTime();
  if (Number.isNaN(timestamp)) {
    return '';
  }

  return date.toISOString().split('T')[0];
};

/**
 * Format a date to Month-Year format (e.g., "Jan-2024")
 * @param {Date|null} dateValue - The date to format
 * @returns {string} - Formatted string or '--' if invalid
 */
export const formatMonthYear = (dateValue) => {
  if (!dateValue) {
    return '--';
  }
  return `${dateValue.toLocaleString('en-us', {
    month: 'short',
  })}-${dateValue.toLocaleString('en-us', {
    year: 'numeric',
  })}`;
};
