import { subMonths, addDays, format } from 'date-fns';

export const oneMonthAgoDate = format(subMonths(new Date(), 1), 'yyyy-MM-dd');

export const endDayIncludingToday = format(addDays(new Date(), 1), 'yyyy-MM-dd');

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
