import * as moment from 'moment';

export interface AccountSubscriptionDates {
  startDate: string;
  endDate: string;
  subscriptionYearEnd: string;
}

/**
 * Calculates the date range for account subscription usage
 * @param renewalTime - The account renewal time
 * @returns Object containing startDate, endDate, and subscriptionYearEnd
 */
export function calculateAccountSubscriptionDates(
  renewalTime: string | Date
): AccountSubscriptionDates {
  // Convert all dates to UTC to avoid timezone issues
  const today = moment.utc().startOf('day');
  const todayAsEndDay = today.clone().add(1, 'day');
  const accountActivationDate = moment.utc(renewalTime).startOf('day');

  // Calculate the start date by finding the most recent renewal date
  const daysSinceActivation = today.diff(accountActivationDate, 'days');
  const yearsSinceActivation = Math.floor(daysSinceActivation / 365);
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
