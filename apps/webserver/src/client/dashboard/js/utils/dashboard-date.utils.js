import moment from 'moment';
import groupBy from 'lodash/groupBy';

import { SELECTED_TIMEFRAME_GLAD_MAPPING, SELECTED_TIMEFRAME_VIIRS_MAPPING } from '../config/dashboard.config';
import * as dictionary from './dictionary';
import { getTimeframeBoundaries } from './dateUtils';

export const DATE_FORMAT__DAY = 'YYYY-MM-DD';
export const DATE_FORMAT__WEEK = 'YYYY-w';
export const DATE_FORMAT__MONTH = 'YYYY-MM';

// CSV formats
export const DATE_FORMAT__CSV = 'DD MMM YYYY';

/**
 * Get Dashboard Days Range
 * Date format - 'YYYY-MM-DD'
 *
 * @param {number} [numberOfDays = 1] - Number of days
 * @return {string[]} - List of Formated Days Range (e.g. ['2021-09-13', ...])
 */
export const getDashboardDaysRange = (numberOfDays = 1) => {
  return Array(numberOfDays)
    .fill()
    .map((value, index) =>
      moment()
        .add(-numberOfDays + index, 'day')
        .format(DATE_FORMAT__DAY)
    );
};

/**
 * Get Dashboard Weeks Range
 * Date format - 'YYYY-w'
 *
 * @return {string[]} - List of Formated Days Range (e.g. ['2021-35', ...])
 */
export const getDashboardWeeksRange = () => {
  const todaysDate = moment().format('DD MMM YYYY');
  const isoWeeks = [];
  for (let i = 1; i < 5; i++) {
    const weekDate = moment(todaysDate).subtract(i, 'week');
    const isoWeek = weekDate.format('YYYY-WW');
    isoWeeks.push(isoWeek);
  }
  return isoWeeks.reverse();
};

/**
 * Get Dashboard Quarter Range
 * Date format - 'YYYY-MM'
 *
 * @param {number} [numberOfMonths = 3] - Number of Months (e.g 12 - for year)
 * @return {string[]} - List of Formated Month Range (e.g. ['2021-08', ...])
 */
function getDashboardQuarterRange(numberOfMonths = 3) {
  return Array(numberOfMonths)
    .fill()
    .map((value, index) =>
      moment()
        .add(-numberOfMonths + index, 'month')
        .format(DATE_FORMAT__MONTH)
    );
}

export const DASHBOARD_ONE_DAY_RANGE = getDashboardDaysRange();
export const DASHBOARD_DAYS_RANGE = getDashboardDaysRange(7);
export const DASHBOARD_WEEKS_RANGE = getDashboardWeeksRange();
export const DASHBOARD_QUARTER_RANGE = getDashboardQuarterRange(3);
export const DASHBOARD_YEAR_RANGE = getDashboardQuarterRange(12);

export const TIMEFRAME_RANGE = {
  DAY: DASHBOARD_ONE_DAY_RANGE,
  WEEK: DASHBOARD_DAYS_RANGE,
  MONTH: DASHBOARD_WEEKS_RANGE,
  QUARTER: DASHBOARD_QUARTER_RANGE,
  YEAR: DASHBOARD_YEAR_RANGE,
};

/**
 * Is in Days of Week
 *
 * @param {number} idx - Index in Week range
 * @param {string} day - Day (e.g '2021-09-15')
 * @return {boolean} - TRUE/FALSE
 */
export function isInDaysOfWeek(idx = 0, day) {
  return DASHBOARD_DAYS_RANGE[idx] === day;
}

/**
 * Is in Weeks of Month
 *
 * @param {number} idx - Index in Month range
 * @param {string} day - Week (e.g '2021-38')
 * @return {boolean} - TRUE/FALSE
 */
export function isInWeeksOfMonth(idx = 0, day) {
  return DASHBOARD_WEEKS_RANGE[idx] === day;
}

/**
 * Is in Month of Quarter
 *
 * @param {number} idx - Index in Quarter range
 * @param {string} day - Month (e.g '2021-07')
 * @return {boolean} - TRUE/FALSE
 */
export function isInMonthsOfQuarter(idx = 0, day) {
  return DASHBOARD_QUARTER_RANGE[idx] === day;
}

/**
 * Is in Month of Year
 *
 * @param {number} idx - Index in Year range
 * @param {string} day - Month (e.g '2021-03')
 * @return {boolean} - TRUE/FALSE
 */
export function isInMonthsOfYear(idx = 0, day) {
  return DASHBOARD_YEAR_RANGE[idx] === day;
}

/**
 * Get GLAD Daily
 *
 * @param {Object} feature - Single location
 * @return {Object[]} - Filtered alerts
 */
export function getGladDaily(feature) {
  return feature.properties.glad_alerts_daily.filter((date) => {
    return DASHBOARD_DAYS_RANGE.includes(date.day);
  });
}

/**
 * Get GLAD Weekly
 *
 * @param {Object} feature - Single location
 * @return {Object[]} - Filtered alerts
 */
export function getGladWeekly(feature) {
  return feature.properties.glad_alerts_weekly.filter((date) => {
    return DASHBOARD_WEEKS_RANGE.includes(date.day);
  });
}

/**
 * Get GLAD Monthly Quarter
 *
 * @param {Object} feature - Single location
 * @return {Object[]} - Filtered alerts
 */
export function getGladMonthlyQuarter(feature) {
  return feature.properties.glad_alerts_monthly.filter((date) => {
    return DASHBOARD_QUARTER_RANGE.includes(date.day);
  });
}

/**
 * Get GLAD Monthly Year
 *
 * @param {Object} feature - Single location
 * @return {Object[]} - Filtered alerts
 */
export function getGladMonthlyYear(feature) {
  return feature.properties.glad_alerts_monthly.filter((date) => {
    return DASHBOARD_YEAR_RANGE.includes(date.day);
  });
}

/**
 * Get VIIRS Grouped
 *
 * @param {Object} feature - Single location
 * @param {moment.Moment} momentStart - Moment date start
 * @param {moment.Moment} momentEnd - Moment date end
 * @param {moment.unitOfTime.StartOf} propertyFilter - Property Filter (e.g. 'day' | 'week' | 'month')
 * @return {Object | 'delete'} - List of VIIRS alerts
 */
export function getViirsGrouped(feature, momentStart, momentEnd, propertyFilter) {
  return groupBy(feature.properties.viirs_alerts_daily, (alert) => {
    const alertMoment = moment(alert.day);
    if (alertMoment.isBefore(momentStart) || alertMoment.isAfter(momentEnd)) {
      return 'delete';
    } else {
      return alert.day;
    }
  });
}

/**
 * Get Timeframe Attribute
 *
 * @param {string} selectedAlert The type of alerts selected (either `GLAD` or `VIIRS`)
 * @param {string} selectedTimeframe - Selected Timeframe (e.g. 'WEEK', 'MONTH', ...)
 * @return {string} - Timeframe Attribute (e.g. 'glad_alerts_daily', ...)
 */
export function getTimeframeProperty(selectedAlert, selectedTimeframe) {
  const alertMapping = selectedAlert === 'GLAD' ? SELECTED_TIMEFRAME_GLAD_MAPPING : SELECTED_TIMEFRAME_VIIRS_MAPPING;
  return alertMapping[selectedTimeframe];
}

/**
 * Check GLAD/Fires (VIIRS) for - Alerts
 *
 * @param {Object} val - Feature
 * @param {string} selectedTimeframe - Selected Timeframe (e.g. 'WEEK', 'MONTH', ...)
 * @param {string} timeframeProperty - Timeframe Attribute (e.g. 'glad_alerts_daily', ...)
 * @return {boolean} - TRUE/FALSE
 */
export function checkForAlerts(val, selectedTimeframe, timeframeProperty) {
  return val.properties[timeframeProperty].some((date) => {
    return TIMEFRAME_RANGE[selectedTimeframe].includes(date.day);
  });
}

/**
 * Check GLAD/Fires (VIIRS) for - NO Alerts
 *
 * @param {Object} val - Feature
 * @param {string} selectedTimeframe - Selected Timeframe (e.g. 'WEEK', 'MONTH', ...)
 * @param {string} timeframeProperty - Timeframe Attribute (e.g. 'glad_alerts_daily', ...)
 * @return {boolean} - TRUE/FALSE
 */
export function checkForNoAlerts(val, selectedTimeframe, timeframeProperty) {
  return val.properties[timeframeProperty].every((date) => {
    return !TIMEFRAME_RANGE[selectedTimeframe].includes(date.day);
  });
}

/**
 * Get Number of Alerts
 *
 * @param {Object[]} adminUnitData - List of admin Units
 * @param {string} selectedTimeframe - Selected Timeframe (e.g. 'WEEK', 'MONTH', ...)
 * @param {string} timeframeProperty - Timeframe Attribute (e.g. 'glad_alerts_daily', ...)
 * @return {*}
 */
export function getNumberOfAlerts(adminUnitData, selectedTimeframe, timeframeProperty) {
  return adminUnitData
    .map((l) => l.properties[timeframeProperty])
    .map((l) =>
      l.reduce((total, current) => {
        return TIMEFRAME_RANGE[selectedTimeframe].includes(current.day) ? total + current.count : total;
      }, 0)
    )
    .reduce((totalFeatures, current) => totalFeatures + current, 0);
}

/**
 * Get Selected Timeframe ['Start', 'End'] Groupings
 *
 * @param {string} selectedTimeframe - Selected Timeframe (eg. 'DAY', 'WEEK', 'MONTH', 'QUARTER', or 'YEAR')
 * @return {Array[]} - Array of lists containing Timeframe ['Start', 'End'] Groupings
 */
export function getSelectedTimeframeStartEndGroupings(selectedTimeframe) {
  let selectedTimeframe_StartEndGroupings = [];
  if (selectedTimeframe === 'MONTH') {
    // For the month periods we are using ISO weeks and ISO week start day is Monday and end day is Sunday
    const last4Weeks = getDashboardWeeksRange();
    selectedTimeframe_StartEndGroupings = last4Weeks.map((week) => {
      const startOfWeek = moment(week, 'YYYY-WW').startOf('isoWeek').format(DATE_FORMAT__CSV);
      const endOfWeek = moment(week, 'YYYY-WW').endOf('isoWeek').format(DATE_FORMAT__CSV);
      return [startOfWeek, endOfWeek];
    });
  } else {
    const selectedTimePeriod = dictionary.timeframe_dateGroupBy[selectedTimeframe];
    const { start, end } = getTimeframeBoundaries(selectedTimeframe);
    const startMoment = moment(start);
    const endMoment = moment(end);

    let currentMoment = startMoment;
    while (currentMoment.isSameOrBefore(endMoment)) {
      selectedTimeframe_StartEndGroupings.push([
        currentMoment.startOf(selectedTimePeriod).format(DATE_FORMAT__CSV),
        currentMoment.endOf(selectedTimePeriod).format(DATE_FORMAT__CSV),
      ]);
      currentMoment = currentMoment.add(1, selectedTimePeriod).startOf('day');
    }
  }

  return selectedTimeframe_StartEndGroupings;
}
