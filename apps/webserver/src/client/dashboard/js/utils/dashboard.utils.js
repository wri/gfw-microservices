import moment from 'moment';
import isEmpty from 'lodash/isEmpty';

import store from '../store';
import * as dictionary from './dictionary';

import { getTimeframeBoundaries } from './dateUtils';
import {
  getGladDaily,
  getGladMonthlyQuarter,
  getGladMonthlyYear,
  getGladMonthlyMonth,
  getSelectedTimeframeStartEndGroupings,
  getViirsGrouped,
} from './dashboard-date.utils';
import axios from 'axios';

/**
 * Calculates the number of alerts for the dashboard
 * @param {Object} geoJSON The GeoJSON for the list
 * @param {Object} failedGeoJSON The GeoJSON containing the failed locations
 * @param {String} selectedAlert The type of alerts selected (either `GLAD` or `VIIRS`)
 * @param {Object} filteredLocationGeoJSON A GeoJSON containing filtered locations based on the selectedAlert
 * @param {Object} filteredDissolvedGeoJSON A GeoJSON containing the dissolved list
 * @param {Array}  locationIdsWithAlerts A array of location IDs that have alerts
 * @returns {Object} Returns an object containing the resulting number of alerts for a given list processed in the dashboard
 */
function calculateAlerts(
  geoJSON,
  failedGeoJSON,
  selectedAlert,
  filteredLocationGeoJSON,
  filteredDissolvedGeoJSON
) {
  const selectedAlertsProperty = dictionary.alertType_featureCoverageProperty[selectedAlert];
  const totalLocations = geoJSON.features.length + failedGeoJSON.features.length;
  let locationIdsWithAlerts = [];
  let locationIdsWithoutAlerts = [];

  let locationsWithinAlerts = 0;
  let locationsWithAlerts = 0;

  if (selectedAlert === 'GLAD') {
    filteredLocationGeoJSON.forEach((feature) => {
      locationsWithinAlerts += feature.properties[selectedAlertsProperty] ? 1 : 0;
      if (
        feature.properties[selectedAlertsProperty] &&
        feature.properties.gladTimeframe.length > 0
      ) {
        locationsWithAlerts += 1;
        locationIdsWithAlerts.push(feature.properties.location_id);
      } else {
        locationIdsWithoutAlerts.push(feature.properties.location_id);
      }
    });

    const percentageWithAlerts = (locationsWithAlerts / locationsWithinAlerts) * 100;
    const totalAlerts = filteredDissolvedGeoJSON.features
      .map((f) => {
        return f.properties.gladTimeframe;
      })
      .flat()
      .reduce((acc, curr) => acc + curr.count, 0);

    return {
      totalLocations,
      totalAlerts,
      percentageAlerts: percentageWithAlerts,
      withAlerts: locationsWithAlerts,
      withinAlerts: locationsWithinAlerts,
      locationIdsWithAlerts,
      locationIdsWithoutAlerts,
    };
  } else {
    //FIRE Alerts
    //TODO: Refactor to make less round trips and array iterations, perhaps one for loop would be enough
    const locationsWithAlertsCount = filteredLocationGeoJSON.filter(
      (f) => Object.values(f.properties.fireTimeframe).length > 0
    );
    locationIdsWithAlerts = locationsWithAlertsCount.map((f) => f.properties.location_id);
    const locationsWithoutAlertsCount = filteredLocationGeoJSON.filter(
      (f) => Object.values(f.properties.fireTimeframe).length === 0
    );
    locationIdsWithoutAlerts = locationsWithoutAlertsCount.map((f) => f.properties.location_id);
    const percentageWithAlerts = (locationsWithAlertsCount.length / totalLocations) * 100;

    const totalAlerts = filteredDissolvedGeoJSON.features.reduce((acc, feature) => {
      const selectedData = feature.properties.fireTimeframe;
      const featureAlertTotal = Object.values(selectedData)
        .map((arr) => arr.reduce((total, element) => total + element.count, 0))
        .reduce((featureTotal, el) => featureTotal + el, 0);
      return acc + featureAlertTotal;
    }, 0);

    locationsWithinAlerts = totalLocations;
    return {
      totalLocations,
      totalAlerts,
      percentageAlerts: percentageWithAlerts,
      withAlerts: locationsWithAlertsCount.length,
      withinAlerts: locationsWithinAlerts,
      locationIdsWithAlerts,
      locationIdsWithoutAlerts,
    };
  }
}

/**
 * Sorting dates
 * @param a
 * @param b
 * @returns {number}
 */
function momentSort(a, b) {
  const momentA = moment(a.start, 'DD MMM YYYY');
  const momentB = moment(b.start, 'DD MMM YYYY');
  return momentA.diff(momentB);
}

function applyLocationFilter(geojson, locationFilters, selectedAlert, selectedTimeframe) {
  const { ALERTS, NOALERTS } = locationFilters;
  const selectedCoverageProperty = dictionary.alertType_featureCoverageProperty[selectedAlert];
  const selectedTimeframeProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];

  let filteredFeaturesCount = 0;
  geojson.features.forEach((feature) => {
    if (!ALERTS && !NOALERTS) {
      filteredFeaturesCount++;
    } else if (ALERTS && NOALERTS && feature.properties[selectedCoverageProperty]) {
      filteredFeaturesCount++;
    } else if (
      ALERTS &&
      !NOALERTS &&
      feature.properties[selectedCoverageProperty] &&
      !isEmpty(feature.properties[selectedTimeframeProperty])
    ) {
      filteredFeaturesCount++;
    } else if (
      !ALERTS &&
      NOALERTS &&
      feature.properties[selectedCoverageProperty] &&
      isEmpty(feature.properties[selectedTimeframeProperty])
    ) {
      filteredFeaturesCount++;
    }
  });
  return filteredFeaturesCount;
}

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
      feature.properties.hasOwnProperty('glad_alerts_daily') &&
      feature.properties.glad_alerts_daily.length > 0
    ) {
      groupedGlad = getGladDaily(feature);
    }

    // Month timeframe
    if (
      selectedTimeframe === 'MONTH' &&
      feature.properties.hasOwnProperty('glad_alerts_monthly') &&
      feature.properties.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyMonth(feature);
    }

    // Quarter timeframe
    if (
      selectedTimeframe === 'QUARTER' &&
      feature.properties.hasOwnProperty('glad_alerts_monthly') &&
      feature.properties.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyQuarter(feature);
    }

    // Year timeframe
    if (
      selectedTimeframe === 'YEAR' &&
      feature.properties.hasOwnProperty('glad_alerts_monthly') &&
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
      feature.properties.hasOwnProperty('glad_alerts_daily') &&
      feature.properties.glad_alerts_daily.length > 0
    ) {
      groupedGlad = getGladDaily(feature);
    }

    if (
      selectedTimeframe === 'MONTH' &&
      feature.properties.hasOwnProperty('glad_alerts_monthly') &&
      feature.properties.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyMonth(feature);
    }

    if (
      selectedTimeframe === 'QUARTER' &&
      feature.properties.hasOwnProperty('glad_alerts_monthly') &&
      feature.properties.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyQuarter(feature);
    }

    if (
      selectedTimeframe === 'YEAR' &&
      feature.properties.hasOwnProperty('glad_alerts_monthly') &&
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
  const { id: listID } = selectedList;

  const data = {
    listID,
    format: 'csv',
    type: 'alerts',
    selectedAlert,
    selectedTimeframe,
  };

  gtag('event', 'Download button clicked', {
    event_category: 'Dashboard Download',
    event_label: 'user downloaded dashboard data',
  });

  return axios({
    url: `/locations/csv/${listID}`,
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json',
    },
    params: data,
  }).then((response) => response.data);
}

export {
  applyTimeframeFilter,
  applyLocationFilter,
  applyTimeframeFilterRemix,
  downloadDashboard,
  calculateAlerts,
};
