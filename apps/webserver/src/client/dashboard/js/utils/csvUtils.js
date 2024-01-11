import moment from 'moment';
import isEmpty from 'lodash/isEmpty';

import * as dictionary from './dictionary';

import { getTimeframeBoundaries } from './dateUtils';
import {
  getGladDaily,
  getGladMonthlyQuarter,
  getGladMonthlyYear,
  getGladMonthlyMonth,
  getViirsGrouped,
} from './dashboard-date.utils';

import store from '../store';
import downloadRequest from "../../../locations/js/components/lists/download/downloadRequest";

function applyTimeframeFilter(geojson, selectedTimeframe) {
  const propertyFilter = dictionary.timeframe_dateGroupBy[selectedTimeframe];
  const { start, end } = getTimeframeBoundaries(selectedTimeframe);
  const momentStart = moment(start);
  const momentEnd = moment(end);

  for (let idx = 0; idx < geojson.features.length; idx++) {
    const feature = geojson.features[idx];
    let groupedGlad = [];

    // Week timeframe
    if (
      selectedTimeframe === 'WEEK' &&
      Object.prototype.hasOwnProperty.call(feature.properties, 'glad_alerts_daily') &&
      feature.properties.glad_alerts_daily.length > 0
    ) {
      groupedGlad = getGladDaily(feature);
    }

    // Month timeframe
    if (
      selectedTimeframe === 'MONTH' &&
      Object.prototype.hasOwnProperty.call(feature.properties, 'glad_alerts_monthly') &&
      feature.properties.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyMonth(feature);
    }

    // Quarter timeframe
    if (
      selectedTimeframe === 'QUARTER' &&
      Object.prototype.hasOwnProperty.call(feature.properties, 'glad_alerts_monthly') &&
      feature.properties.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyQuarter(feature);
    }

    // Year timeframe
    if (
      selectedTimeframe === 'YEAR' &&
      Object.prototype.hasOwnProperty.call(feature.properties, 'glad_alerts_monthly') &&
      feature.properties.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyYear(feature);
    }

    const groupedViirs = getViirsGrouped(feature, momentStart, momentEnd, propertyFilter);

    delete groupedGlad.delete;
    delete groupedViirs.delete;
    feature.properties.gladTimeframe = groupedGlad;
    feature.properties.fireTimeframe = groupedViirs;
  }

  return geojson;
}

// We remixed the function above in order to ensure that the dashboard footer & chart data only updated in certain circumstances.
function applyTimeframeFilterRemix(geojson, selectedTimeframe) {
  const propertyFilter = dictionary.timeframe_dateGroupBy[selectedTimeframe];
  const { start, end } = getTimeframeBoundaries(selectedTimeframe);
  const momentStart = moment(start);
  const momentEnd = moment(end);

  const placeholderArray = [];
  for (let idx = 0; idx < geojson.features.length; idx++) {
    const feature = geojson.features[idx];
    let groupedGlad = [];
    if (
      selectedTimeframe === 'WEEK' &&
      Object.prototype.hasOwnProperty.call(feature.properties, 'glad_alerts_daily') &&
      feature.properties.glad_alerts_daily.length > 0
    ) {
      groupedGlad = getGladDaily(feature);
    }

    if (
      selectedTimeframe === 'MONTH' &&
      Object.prototype.hasOwnProperty.call(feature.properties, 'glad_alerts_monthly') &&
      feature.properties.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyMonth(feature);
    }

    if (
      selectedTimeframe === 'QUARTER' &&
      Object.prototype.hasOwnProperty.call(feature.properties, 'glad_alerts_monthly') &&
      feature.properties.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyQuarter(feature);
    }

    if (
      selectedTimeframe === 'YEAR' &&
      Object.prototype.hasOwnProperty.call(feature.properties, 'glad_alerts_monthly') &&
      feature.properties.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyYear(feature);
    }

    const groupedViirs = getViirsGrouped(feature, momentStart, momentEnd, propertyFilter);

    delete groupedGlad.delete;
    delete groupedViirs.delete;
    feature.properties.gladTimeframe = groupedGlad;
    feature.properties.fireTimeframe = groupedViirs;
    placeholderArray.push(feature);
  }

  return placeholderArray;
}

/**
 * @desc Download all ZIP compressed CSV files
 */
function downloadDashboard() {
  const state = store.getState();
  const { selectedList, selectedAlert, selectedTimeframe } = state;
  const { id: listID} = selectedList




  downloadRequest({
    listID,
    format: 'csv',
    type: 'alerts',
    selectedAlert,
    selectedTimeframe
  })
}

module.exports = {
  applyTimeframeFilter,
  applyTimeframeFilterRemix,
  downloadDashboard,
};
