import moment from 'moment';

const DATE_FORMAT = 'DD MMM YYYY';

/**
 * Get start - end timeframe Boundaries based on selected Timeframe
 * @param {String} selectedTimeframe - Selected Timeframe (eg. 'DAY', 'WEEK', 'MONTH', 'QUARTER', or 'YEAR')
 * @returns {{start: string, end: string}}
 */
export const getTimeframeBoundaries = (selectedTimeframe) => {
  switch (selectedTimeframe) {
    case 'DAY': {
      return {
        // start: moment().startOf('day').format(DATE_FORMAT),
        // end: moment().endOf('day').format(DATE_FORMAT),
        start: moment().subtract(1, 'days').format(DATE_FORMAT),
        end: moment().endOf('day').format(DATE_FORMAT),
      };
    }
    case 'WEEK': {
      return {
        start: moment().subtract(1, 'week').startOf('week').format(DATE_FORMAT),
        end: moment().subtract(1, 'week').endOf('week').format(DATE_FORMAT),
      };
    }
    case 'MONTH': {
      return {
        start: moment().subtract(1, 'month').startOf('month').format(DATE_FORMAT),
        end: moment().subtract(1, 'month').endOf('month').format(DATE_FORMAT),
      };
    }
    case 'QUARTER': {
      return {
        start: moment().subtract(3, 'month').startOf('month').format(DATE_FORMAT),
        end: moment().subtract(1, 'month').endOf('month').format(DATE_FORMAT),
      };
    }
    case 'YEAR': {
      return {
        start: moment().subtract(12, 'month').startOf('month').format(DATE_FORMAT),
        end: moment().subtract(1, 'month').endOf('month').format(DATE_FORMAT),
      };
    }
  }
};
