/**
 * Formats a timestamp to ISO date string (YYYY-MM-DD)
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} - ISO date string
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};

/**
 * Formats a timestamp to display date string (MM/DD/YYYY)
 * Uses UTC to avoid timezone offset issues
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} - Formatted date string
 */
export const formatDisplayDate = (timestamp) => {
  const date = new Date(timestamp);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
};

export const MILLISECONDS_PER_DAY = 86400000;
