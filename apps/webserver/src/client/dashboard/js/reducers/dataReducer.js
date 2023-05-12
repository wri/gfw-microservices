import moment from 'moment';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';

import * as types from '../actions/actionTypes';

import { getTimeframeBoundaries } from '../utils/dateUtils';
import dictionary from '../utils/dictionary';
import {
  getGladDaily,
  getGladMonthlyQuarter,
  getGladMonthlyYear,
  getGladWeekly,
  getViirsGrouped,
} from '../utils/dashboard-date.utils';

function filterGeoJSON(geojson, zoomLevel, selectedAdmin) {
  switch (zoomLevel) {
    case 0:
      return geojson;
    case 1:
    case 2:
    case 3: {
      const filteredFeatures = [];

      geojson.features.forEach((feature) => {
        const parsedFeaturedGADM = feature.properties[`gadmid_${zoomLevel - 1}`];
        if (parsedFeaturedGADM === selectedAdmin) {
          filteredFeatures.push(feature);
        }
      });

      // Deep clone to avoid mutation
      const clonedGeoJSON = JSON.parse(JSON.stringify(geojson));
      clonedGeoJSON.features = filteredFeatures;
      return clonedGeoJSON;
    }
  }
}

function groupGeoJSON(geojson, zoomLevel) {
  // If the Admin level is defined above, we need to group features together for that admin area
  if (zoomLevel < 3) {
    const selectedProperty = dictionary.zoomLevel_gadmidGroupBy[zoomLevel];
    const groupedObject = groupBy(geojson.features, (location) => location.properties[selectedProperty]);
    return groupedObject;
  } else {
    // Otherwise return individual locations but manipulated for consistency
    return geojson.features.reduce((accumulator, current, idx) => {
      accumulator[idx] = current;
      return accumulator;
    }, {});
  }
}

function applyDataReducerTimeframeFilter(filteredLocationsObject, selectedTimeframe, zoomLevel) {
  const { start, end } = getTimeframeBoundaries(selectedTimeframe);
  const momentStart = moment(start);
  const momentEnd = moment(end);
  const propertyFilter = dictionary.timeframe_dateGroupBy[selectedTimeframe];
  const filteredObject = {};
  const entries = Object.entries(filteredLocationsObject);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (zoomLevel < 3) {
      const [key, featuresArray] = entry;
      const filteredFeaturesArray = featuresArray.map((feature) => {
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
          feature.properties.hasOwnProperty('glad_alerts_weekly') &&
          feature.properties.glad_alerts_weekly.length > 0
        ) {
          groupedGlad = getGladWeekly(feature);
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

        if (groupedGlad.hasOwnProperty('delete')) {
          delete groupedGlad.delete;
        }

        if (groupedViirs.hasOwnProperty('delete')) {
          delete groupedViirs.delete;
        }

        // Extract the items that are within the timeframe selected.
        feature.properties.gladTimeframe = groupedGlad;
        feature.properties.fireTimeframe = groupedViirs;

        return feature;
      });

      filteredObject[key] = filteredFeaturesArray;
    } else {
      // If we are at the location level
      const [key, feature] = entry;
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
        feature.properties.hasOwnProperty('glad_alerts_weekly') &&
        feature.properties.glad_alerts_weekly.length > 0
      ) {
        groupedGlad = getGladWeekly(feature);
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

      filteredObject[key] = feature;
    }
  }

  return filteredObject;
}

/**
 * Apply Location Filters
 * @param {Object} groupedObject - Grouped features for selected admin level
 * @param {Object} locationFilters - Locations with selected (eg. {ALERTS: false, FLAGGED: false, NOALERTS: false})
 * @param {String} selectedAlert - Type of Alert (eg. 'GLAD' or 'VIIRS')
 * @param {Number} zoomLevel - Current zoom level for selected dashboard admin
 * @returns {Object} filteredObject - Filtered location object
 */
function applyLocationFilters(groupedObject, locationFilters, selectedAlert, zoomLevel) {
  const { ALERTS, NOALERTS } = locationFilters;
  const selectedCoverageProperty = dictionary.alertType_featureCoverageProperty[selectedAlert];
  const selectedTimeframeProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];

  /**
   * Process when only Alerts or No Alerts checkbox is selected.
   * Skip processing when both (Alerts and No Alerts) checkboxes are selected or unselected.
   */
  const onlyAlertsSelected = ALERTS && !NOALERTS;
  const onlyNoAlertsSelected = !ALERTS && NOALERTS;
  if (onlyAlertsSelected || onlyNoAlertsSelected) {
    const filteredObject = {};
    Object.keys(groupedObject).forEach((adminGroupKey) => {
      if (zoomLevel !== 3) {
        if (onlyAlertsSelected) {
          filteredObject[adminGroupKey] = groupedObject[adminGroupKey].filter(({ properties }) => {
            const hasTimeframeAlerts = isEmpty(properties[selectedTimeframeProperty]);
            return properties[selectedCoverageProperty] && !hasTimeframeAlerts;
          });
        }

        if (onlyNoAlertsSelected) {
          filteredObject[adminGroupKey] = groupedObject[adminGroupKey].filter(({ properties }) => {
            const hasTimeframeAlerts = isEmpty(properties[selectedTimeframeProperty]);
            return properties[selectedCoverageProperty] && hasTimeframeAlerts;
          });
        }
      } else {
        const isSelectedTimeframeEmpty = isEmpty(groupedObject[adminGroupKey].properties[selectedTimeframeProperty]);
        if ((onlyAlertsSelected && !isSelectedTimeframeEmpty) || (onlyNoAlertsSelected && isSelectedTimeframeEmpty)) {
          filteredObject[adminGroupKey] = groupedObject[adminGroupKey];
        }
      }
    });

    return filteredObject;
  }

  return groupedObject;
}

function reduceData(intermediateState, clonedRawData) {
  const { rawData, selectedAlert, selectedTimeframe, selectedAdmin, locationFilters, zoomLevel } = intermediateState;
  // If there is no raw data to process - return
  if (isEmpty(rawData)) {
    return {};
    // Need to process data to conform to state
  } else {
    // 1. Unless at feature zoom level, use the dissolved geojson
    const geojson = zoomLevel < 3 ? clonedRawData.dissolvedGeoJSON : clonedRawData.geojson;
    // 2. Remove unecessary features that are not within the selected admin area (dependent on zoom)
    const filteredGeoJSON = filterGeoJSON(geojson, zoomLevel, selectedAdmin);
    // 3. Group the filtered geojson by either Countries, States, SubStates
    const groupedObject = groupGeoJSON(filteredGeoJSON, zoomLevel);
    // 4. Filter and group timeframe for the selected alert
    const filteredTimeframeObject = applyDataReducerTimeframeFilter(groupedObject, selectedTimeframe, zoomLevel);
    // 5. Apply the location filters
    const filteredLocationsObject = applyLocationFilters(
      filteredTimeframeObject,
      locationFilters,
      selectedAlert,
      zoomLevel
    );

    return filteredLocationsObject;
  }
}

// REDUCER
export default function dataReducer(intermediateState = {}, previousState = {}, action, clonedRawData) {
  const { data } = previousState;
  switch (action.type) {
    case types.SELECT_ALERT:
    case types.SELECT_TIMEFRAME:
    case types.UPDATE_LOCATION_FILTER:
    case types.SAVE_RAW_DATA:
    case types.INCREMENT_ZOOM:
    case types.RESET_ZOOM:
      return reduceData(intermediateState, clonedRawData);
    default:
      return typeof data === 'undefined' ? {} : data;
  }
}
