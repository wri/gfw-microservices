import {
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  endOfDay,
  format,
} from 'date-fns';

const DATE_FORMAT = 'dd MMM yyyy';

/**
 * Get start - end timeframe Boundaries based on selected Timeframe
 * @param {String} selectedTimeframe - Selected Timeframe (eg. 'DAY', 'WEEK', 'MONTH', 'QUARTER', or 'YEAR')
 * @returns {{start: string, end: string}}
 */
export const getTimeframeBoundaries = (selectedTimeframe) => {
  switch (selectedTimeframe) {
    case 'DAY': {
      return {
        // start: format(startOfDay(new Date()), DATE_FORMAT),
        start: format(subDays(new Date(), 1), DATE_FORMAT),
        end: format(endOfDay(new Date()), DATE_FORMAT),
      };
    }
    case 'WEEK': {
      const lastWeek = subWeeks(new Date(), 1);
      return {
        start: format(startOfWeek(lastWeek), DATE_FORMAT),
        end: format(endOfWeek(lastWeek), DATE_FORMAT),
      };
    }
    case 'MONTH': {
      const lastMonth = subMonths(new Date(), 1);
      return {
        start: format(startOfMonth(lastMonth), DATE_FORMAT),
        end: format(endOfMonth(lastMonth), DATE_FORMAT),
      };
    }
    case 'QUARTER': {
      const threeMonthsAgo = subMonths(new Date(), 3);
      const oneMonthAgo = subMonths(new Date(), 1);
      return {
        start: format(startOfMonth(threeMonthsAgo), DATE_FORMAT),
        end: format(endOfMonth(oneMonthAgo), DATE_FORMAT),
      };
    }
    case 'YEAR': {
      const twelveMonthsAgo = subMonths(new Date(), 12);
      const oneMonthAgo = subMonths(new Date(), 1);
      return {
        start: format(startOfMonth(twelveMonthsAgo), DATE_FORMAT),
        end: format(endOfMonth(oneMonthAgo), DATE_FORMAT),
      };
    }
  }
};
