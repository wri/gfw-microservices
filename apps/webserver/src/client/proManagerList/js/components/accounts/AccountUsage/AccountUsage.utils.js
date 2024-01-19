import moment from 'moment';

export const oneMonthAgoDate = moment().subtract(1, 'months').format('YYYY-MM-DD');

export const todaysDate = moment().add(1, 'day').format('YYYY-MM-DD');

export const todaysDateISOString = new Date().toISOString().slice(0, 10);

export const getOneDayBeforeEndDate = (endDate) => {
  const oneDayBeforeEndDate = new Date(endDate);
  oneDayBeforeEndDate.setDate(oneDayBeforeEndDate.getDate() - 1);
  return oneDayBeforeEndDate.toISOString().slice(0, 10);
};

export const getOneDayAfterStartDate = (startDate) => {
  const oneDayAfterStartDate = new Date(startDate);
  oneDayAfterStartDate.setDate(oneDayAfterStartDate.getDate() + 1);
  return oneDayAfterStartDate.toISOString().slice(0, 10);
};
