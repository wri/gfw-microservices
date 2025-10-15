import moment from 'moment';

export const oneMonthAgoDate = moment().subtract(1, 'months').format('YYYY-MM-DD');

export const endDayIncludingToday = moment().add(1, 'day').format('YYYY-MM-DD');

export const todaysDateISOString = new Date().toISOString().slice(0, 10);

export const getOneDayBeforeEndDate = (endDate) => {
  if (!endDate) {
    return '';
  }

  const date = new Date(endDate);
  if (isNaN(date)) {
    return '';
  }
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

export const getOneDayAfterStartDate = (startDate) => {
  if (!startDate) {
    return '';
  }

  const date = new Date(startDate);
  if (isNaN(date)) {
    return '';
  }
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};
