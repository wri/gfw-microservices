import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from 'date-fns';
import groupBy from 'lodash/groupBy';

import {
  SELECTED_TIMEFRAME_GLAD_MAPPING,
  SELECTED_TIMEFRAME_VIIRS_MAPPING,
} from '../config/dashboard.config';
import * as dictionary from './dictionary';
import { getTimeframeBoundaries } from './dateUtils';

export const DATE_FORMAT__DAY = 'yyyy-MM-dd';
export const DATE_FORMAT__WEEK = 'yyyy-w';
export const DATE_FORMAT__MONTH = 'yyyy-MM';

// CSV formats
export const DATE_FORMAT__CSV = 'dd MMM yyyy';

/**
 * Get Dashboard Days Range
 * Date format - 'yyyy-MM-dd'
 *
 * @param {number} [numberOfDays = 1] - Number of days
 * @return {string[]} - List of Formated Days Range (e.g. ['2021-09-13', ...])
 */
export const getDashboardDaysRange = (numberOfDays = 1) => {
  return Array(numberOfDays)
    .fill()
    .map((value, index) => format(addDays(new Date(), -numberOfDays + index), DATE_FORMAT__DAY));
};

/**
 * Get Dashboard Monthly Range
 * Date format - 'yyyy-MM'
 *
 * @param {number} [numberOfMonths] - Number of Months (e.g 12 - for year)
 * @return {string[]} - List of Formated Month Range (e.g. ['2021-08', ...])
 */
function getDashboardMonthlyRange(numberOfMonths) {
  return Array(numberOfMonths)
    .fill()
    .map((value, index) =>
      format(addMonths(new Date(), -numberOfMonths + index), DATE_FORMAT__MONTH)
    );
}

export const DASHBOARD_ONE_DAY_RANGE = getDashboardDaysRange();
export const DASHBOARD_DAYS_RANGE = getDashboardDaysRange(7);
export const DASHBOARD_MONTH_RANGE = getDashboardMonthlyRange(1);
export const DASHBOARD_QUARTER_RANGE = getDashboardMonthlyRange(3);
export const DASHBOARD_YEAR_RANGE = getDashboardMonthlyRange(12);

export const TIMEFRAME_RANGE = {
  DAY: DASHBOARD_ONE_DAY_RANGE,
  WEEK: DASHBOARD_DAYS_RANGE,
  MONTH: DASHBOARD_MONTH_RANGE,
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
export function isInMonthsOfMonth(idx = 0, day) {
  return DASHBOARD_MONTH_RANGE[idx] === day;
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
 * Get GLAD Monthly data for last month
 *
 * @param {Object} feature - Single location
 * @return {Object[]} - Filtered alerts
 */
export function getGladMonthlyMonth(feature) {
  return feature.properties.glad_alerts_monthly.filter((date) => {
    return DASHBOARD_MONTH_RANGE.includes(date.day);
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
 * @param {Date} momentStart - Date start
 * @param {Date} momentEnd - Date end
 * @param {string} propertyFilter - Property Filter (e.g. 'day' | 'week' | 'month')
 * @return {Object | 'delete'} - List of VIIRS alerts
 */
export function getViirsGrouped(feature, momentStart, momentEnd) {
  return groupBy(feature.properties.viirs_alerts_daily, (alert) => {
    const alertDate = new Date(alert.day);
    if (isBefore(alertDate, momentStart) || isAfter(alertDate, momentEnd)) {
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
  const alertMapping =
    selectedAlert === 'GLAD' ? SELECTED_TIMEFRAME_GLAD_MAPPING : SELECTED_TIMEFRAME_VIIRS_MAPPING;
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
        return TIMEFRAME_RANGE[selectedTimeframe].includes(current.day)
          ? total + current.count
          : total;
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
  const selectedTimePeriod = dictionary.timeframe_dateGroupBy[selectedTimeframe];
  const { start, end } = getTimeframeBoundaries(selectedTimeframe);

  let currentDate = new Date(start);
  const endDate = new Date(end);

  while (isSameDay(currentDate, endDate) || !isAfter(currentDate, endDate)) {
    let periodStart, periodEnd;

    if (selectedTimePeriod === 'day') {
      periodStart = startOfDay(currentDate);
      periodEnd = endOfDay(currentDate);
      currentDate = addDays(currentDate, 1);
    } else if (selectedTimePeriod === 'week') {
      periodStart = startOfWeek(currentDate);
      periodEnd = endOfWeek(currentDate);
      currentDate = addWeeks(currentDate, 1);
    } else if (selectedTimePeriod === 'month') {
      periodStart = startOfMonth(currentDate);
      periodEnd = endOfMonth(currentDate);
      currentDate = addMonths(currentDate, 1);
    }

    selectedTimeframe_StartEndGroupings.push([
      format(periodStart, DATE_FORMAT__CSV),
      format(periodEnd, DATE_FORMAT__CSV),
    ]);
  }

  return selectedTimeframe_StartEndGroupings;
}

export function getGladByTimeFrame(selectedTimeframe, feature) {
  const gladFunctions = {
    WEEK: getGladDaily,
    MONTH: getGladMonthlyMonth,
    QUARTER: getGladMonthlyQuarter,
    YEAR: getGladMonthlyYear,
  };

  const gladAlerts =
    selectedTimeframe === 'WEEK'
      ? feature.properties.glad_alerts_daily
      : feature.properties.glad_alerts_monthly;

  if (gladAlerts?.length > 0) {
    return gladFunctions[selectedTimeframe](feature);
  }

  return [];
}
