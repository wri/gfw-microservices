// Whenever you change this file need also to update: libs/shared/src/subscription/utils/accountSubscriptionDates.ts

/**
 * Formats a date in UTC as YYYY-MM-DD
 */
function formatUTCDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date in UTC as "Month D, YYYY" (e.g., "January 1, 2025")
 */
function formatUTCLongDate(date) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Adds years to a UTC date, preserving the UTC date components
 */
function addUTCYears(date, years) {
  return new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Adds days to a UTC date, preserving the UTC date components
 */
function addUTCDays(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Calculates the date range for account subscription usage
 * @param {string|Date} renewalTime - The account renewal time
 * @returns {Object} Object containing startDate, endDate, and subscriptionYearEnd
 */
export function calculateAccountSubscriptionDates(renewalTime) {
  // Work entirely in UTC to avoid timezone issues
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayAsEndDay = addUTCDays(today, 1);

  const renewalDate = new Date(renewalTime);
  const accountActivationDate = new Date(
    Date.UTC(renewalDate.getUTCFullYear(), renewalDate.getUTCMonth(), renewalDate.getUTCDate())
  );

  // Calculate the start date by finding the most recent renewal date
  const daysSinceActivation = Math.floor(
    (today.getTime() - accountActivationDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const yearsSinceActivation = Math.floor(daysSinceActivation / 365.25);
  const accountLatestYearStartDate = addUTCYears(accountActivationDate, yearsSinceActivation);

  // Format dates in UTC
  const subscriptionYearEnd = formatUTCLongDate(addUTCYears(accountLatestYearStartDate, 1));

  return {
    startDate: formatUTCDate(accountLatestYearStartDate),
    endDate: formatUTCDate(todayAsEndDay),
    subscriptionYearEnd,
  };
}
