import moment from 'moment';

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
  const todayAsEndDay = moment().add(1, 'day').startOf('day');
  const accountActivationDate = moment(renewalTime).startOf('day');

  // Calculate the start date by finding the most recent renewal date
  const daysSinceActivation = moment().startOf('day').diff(accountActivationDate, 'days');
  const yearsSinceActivation = Math.floor(daysSinceActivation / 365);
  const accountLatestYearStartDate = accountActivationDate
    .clone()
    .add(yearsSinceActivation, 'years');

  const subscriptionYearEnd = accountLatestYearStartDate.clone().add(1, 'years').format('LL');

  return {
    startDate: accountLatestYearStartDate.format('YYYY-MM-DD'),
    endDate: todayAsEndDay.format('YYYY-MM-DD'),
    subscriptionYearEnd,
  };
}
