// Whenever you change this file need also to update: libs/shared/src/subscription/utils/accountSubscriptionDates.ts
import moment from 'moment';

/**
 * Calculates the date range for account subscription usage
 * @param {string|Date} renewalTime - The account renewal time
 * @returns {Object} Object containing startDate, endDate, and subscriptionYearEnd
 */
export function calculateAccountSubscriptionDates(renewalTime) {
  // Convert all dates to UTC to avoid timezone issues
  const today = moment.utc().startOf('day');
  const todayAsEndDay = today.clone().add(1, 'day');
  const accountActivationDate = moment.utc(renewalTime).startOf('day');

  // Calculate the start date by finding the most recent renewal date
  const daysSinceActivation = today.diff(accountActivationDate, 'days');
  const yearsSinceActivation = Math.floor(daysSinceActivation / 365.25);
  const accountLatestYearStartDate = accountActivationDate
    .clone()
    .add(yearsSinceActivation, 'years');

  // Format dates in UTC to ensure consistency
  const subscriptionYearEnd = accountLatestYearStartDate.clone().add(1, 'years').format('LL');

  return {
    startDate: accountLatestYearStartDate.format('YYYY-MM-DD'),
    endDate: todayAsEndDay.format('YYYY-MM-DD'),
    subscriptionYearEnd,
  };
}
