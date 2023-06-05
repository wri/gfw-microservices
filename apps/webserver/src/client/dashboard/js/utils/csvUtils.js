import JSZip from 'jszip';
import moment from 'moment';
import { saveAs } from 'file-saver';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import _sortBy from 'lodash/sortBy';
import _uniqBy from 'lodash/uniqBy';

import store from '../store';
import * as dictionary from './dictionary';

import { getTimeframeBoundaries } from './dateUtils';
import {
  getGladDaily,
  getGladMonthlyQuarter,
  getGladMonthlyYear,
  getGladWeekly,
  getSelectedTimeframeStartEndGroupings,
  getViirsGrouped,
} from './dashboard-date.utils';

// CONSTANTS
const COLUMN__LOCATION_NAME = 'location_name';
const COLUMN__SUB_STATE = 'Sub State';
const COLUMN__STATE = 'State';
const COLUMN__COUNTRY = 'Country';

const typeCSV = 'text/csv;charset=utf-8';
let subStateCounts = {
  alerts: {},
  density: {},
};

let stateCounts = {
  alerts: {},
  density: {},
};

let countryCounts = {
  alerts: {},
  density: {},
};

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
      feature.properties.hasOwnProperty('glad_alerts_weekly') &&
      feature.properties.glad_alerts_weekly.length > 0
    ) {
      groupedGlad = getGladWeekly(feature);
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
 * Calculate Alert History For List
 * @param {Object} geojson - Geojson object of selected list
 * @param {String} selectedAlert - Type of Alert (eg. 'GLAD' or 'VIIRS')
 * @param {String} selectedTimeframe - Selected Timeframe (eg. 'DAY', 'WEEK', 'MONTH', 'QUARTER', or 'YEAR')
 * @returns {{total: number, start}[]}
 */
const calculateAlertHistoryForList = (geojson, selectedAlert, selectedTimeframe) => {
  const selectedTimeframeProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];
  const selectedTimeframe_StartEndGroupings =
    getSelectedTimeframeStartEndGroupings(selectedTimeframe);

  const { features } = geojson;
  const filtered = features
    .map((f) => f.properties[selectedTimeframeProperty])
    .filter((f) => !isEmpty(f))
    .map((f) => Object.values(f))
    .reduce((acc, val) => acc.concat(val), [])
    .reduce((acc, val) => acc.concat(val), []);

  return selectedTimeframe_StartEndGroupings.map((dateBounds) => {
    const [startBound, endBound] = dateBounds;
    const dateStart = moment(startBound, 'DD MMM YYYY');
    const dateEnd = moment(endBound, 'DD MMM YYYY');
    let total = 0;
    filtered.forEach((countObj) => {
      const { count, day } = countObj;
      if (selectedTimeframe === 'MONTH') {
        const ISOPeriod = moment(dateStart, 'DD MMM YYYY').format('YYYY-WW');
        if (ISOPeriod === day) {
          total += count;
        }
      } else {
        const CURRENT_DATE_FORMAT = 'YYYY-MM-DD';
        const currentM = moment(day, CURRENT_DATE_FORMAT);
        if (currentM.isSameOrAfter(dateStart) && currentM.isSameOrBefore(dateEnd)) {
          total += count;
        }
      }
    });
    return {
      start: startBound,
      total,
    };
  });
};

/**
 * Generate Feature Row Value By Column Name
 * @param {Object} feature - GeoJSON feature properties
 * @param {String} columnName - Name of column
 * @returns {String} - Feature label string
 */
const getFeatureRowValueByColumnName = function (feature, columnName) {
  if (feature.properties[columnName]) {
    return feature.properties[columnName].includes(',')
      ? `"${feature.properties[columnName]}"`
      : feature.properties[columnName];
  } else {
    return '';
  }
};

/**
 * Generate - Alerts Admin Areas Level - CSV file
 * @param {Object} state - Currently selected list state
 * @returns {Blob} blob - Return Alert - Admin Areas Level Level CSV
 */
function generate_Alert_AdminAreasLevel_Csv(state) {
  const { rawData, selectedList, selectedAlert, selectedTimeframe } = state;
  const { dissolvedGeoJSON } = rawData;

  const selectedAlertText = dictionary.alertType_alertText[selectedAlert];
  const timeframeProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];
  const geojson = applyTimeframeFilter(cloneDeep(dissolvedGeoJSON), selectedTimeframe);
  const { start, end } = getTimeframeBoundaries(selectedTimeframe);

  const rows = geojson.features.map((feature) => {
    const selectedData = feature.properties[timeframeProperty];
    // Determine if feature has data coverage
    const listName = selectedList.list_name;
    const startDate = start;
    const endDate = end;

    let featureAlertTotal = 0;
    if (selectedAlert === 'GLAD') {
      featureAlertTotal = selectedData.reduce((acc, val) => acc + val.count, 0);
    } else {
      //VIIRS
      featureAlertTotal = Object.values(selectedData)
        .map((arr) => arr.reduce((total, element) => total + element.count, 0))
        .reduce((featureTotal, el) => featureTotal + el, 0);
    }

    /**
     * Sum feature alerts for selected admin Level
     * @param {Number} currentAlertsCount - Alerts count for current feature
     * @param {Object} adminLevelObject - Sum of all alerts for admin level
     * @param {String} adminLevelName - Name of admin
     */
    const sumFeatureAlertsForAdminLevel = (
      currentAlertsCount,
      adminLevelObject,
      adminLevelName
    ) => {
      const countsObjectValueCurrent = adminLevelObject[adminLevelName] || 0;
      adminLevelObject[adminLevelName] = countsObjectValueCurrent + currentAlertsCount;
    };

    const subStateName = getFeatureRowValueByColumnName(feature, COLUMN__SUB_STATE);
    const stateName = getFeatureRowValueByColumnName(feature, COLUMN__STATE);
    const countryName = getFeatureRowValueByColumnName(feature, COLUMN__COUNTRY);
    sumFeatureAlertsForAdminLevel(featureAlertTotal, subStateCounts.alerts, subStateName);
    sumFeatureAlertsForAdminLevel(featureAlertTotal, stateCounts.alerts, stateName);
    sumFeatureAlertsForAdminLevel(featureAlertTotal, countryCounts.alerts, countryName);

    return [
      listName,
      subStateName,
      stateName,
      countryName,
      selectedAlertText,
      selectedTimeframe,
      startDate,
      endDate,
    ];
  });

  const headers = [
    'List Name',
    'Sub State',
    'State',
    'Country',
    'Alert Type',
    'Timeframe',
    'Start Date',
    'End Date',
    '# of Sub State Level Alerts',
    '# of State Level Alerts',
    '# of Country Level Alerts',
  ];

  rows.map((row) => {
    row.push(subStateCounts.alerts[row[1]]);
    row.push(stateCounts.alerts[row[2]]);
    row.push(countryCounts.alerts[row[3]]);
  });

  const uniqueRows = _uniqBy(rows, (item) => JSON.stringify(item));
  const csv = `${headers.join(',')}\n${_sortBy(uniqueRows, [3, 2, 1]).join('\n')}`;
  return new Blob([csv], { type: typeCSV });
}

/**
 * Generate - Alerts Locations Level - CSV file
 * @param {Object} state - Currently selected list state
 * @returns {Blob} blob - Return Alert - Locations Level CSV
 */
function generate_Alerts_LocationsLevel_Csv(state) {
  const { rawData, selectedList, selectedAlert, selectedTimeframe } = state;
  const selectedAlertText = dictionary.alertType_alertText[selectedAlert];
  const timeframeProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];
  const selectedCoverageProperty = dictionary.alertType_featureCoverageProperty[selectedAlert];
  const geojson = applyTimeframeFilter(cloneDeep(rawData.geojson), selectedTimeframe);
  const { start, end } = getTimeframeBoundaries(selectedTimeframe);

  const rows = geojson.features.map((feature) => {
    const selectedData = feature.properties[timeframeProperty];
    // Determine if feature has data coverage
    const listName = selectedList.list_name;
    const locationName = getFeatureRowValueByColumnName(feature, COLUMN__LOCATION_NAME);
    const subStateName = getFeatureRowValueByColumnName(feature, COLUMN__SUB_STATE);
    const stateName = getFeatureRowValueByColumnName(feature, COLUMN__STATE);
    const countryName = getFeatureRowValueByColumnName(feature, COLUMN__COUNTRY);
    const startDate = start;
    const endDate = end;

    const hasAlerts = feature.properties[selectedCoverageProperty] === true;
    let featureAlertTotal = 0;
    if (selectedAlert === 'GLAD') {
      featureAlertTotal = selectedData.reduce((acc, val) => acc + val.count, 0);
    } else {
      //VIIRS
      featureAlertTotal = Object.values(selectedData)
        .map((arr) => arr.reduce((total, element) => total + element.count, 0))
        .reduce((featureTotal, el) => featureTotal + el, 0);
    }

    const alertPresent = hasAlerts ? featureAlertTotal : 'N/a';
    return [
      listName,
      locationName,
      subStateName,
      stateName,
      countryName,
      selectedAlertText,
      selectedTimeframe,
      startDate,
      endDate,
      alertPresent,
    ];
  });

  const headers = [
    'List Name',
    'Location Name',
    'Sub State',
    'State',
    'Country',
    'Alert Type',
    'Timeframe',
    'Start Date',
    'End Date',
    '# of Location Level Alerts',
  ];

  const csv = `${headers.join(',')}\n${_sortBy(rows, 1).join('\n')}`;
  return new Blob([csv], { type: typeCSV });
}

/**
 * Generate - Alerts History - CSV file
 * @param {Object} state - Currently selected list state
 * @returns {Blob} blob - Return Alerts History CSV
 */
function generate_AlertsHistory_Csv(state) {
  const { rawData, selectedList, selectedAlert, selectedTimeframe } = state;
  const { dissolvedGeoJSON } = rawData;

  const selectedAlertText = dictionary.alertType_alertText[selectedAlert];
  const geojson = applyTimeframeFilter(cloneDeep(dissolvedGeoJSON), selectedTimeframe);
  const groupedTimeframeArray = calculateAlertHistoryForList(
    geojson,
    selectedAlert,
    selectedTimeframe
  );
  const sorted = groupedTimeframeArray.sort(momentSort);

  const endDateSchema = {
    GLAD: {
      WEEK: 'DAY',
      MONTH: 'WEEK',
      QUARTER: 'MONTH',
      YEAR: 'MONTH',
    },
    VIIRS: {
      DAY: 'DAY',
      WEEK: 'DAY',
    },
  };

  const rows = sorted.map((timeframe) => {
    const listName = selectedList.list_name;
    const { start, total } = timeframe;
    const endDate = moment(start, 'DD MMM YYYY')
      .add(1, endDateSchema[selectedAlert][selectedTimeframe])
      .subtract(1, 'days')
      .format('DD MMM YYYY');

    return [listName, selectedAlertText, selectedTimeframe, total, start, endDate];
  });

  const headers = [
    'List Name',
    'Alert Type',
    'Timeframe',
    'Number of Alerts',
    'Start Date',
    'End Date',
  ];

  const csv = `${headers.join(',')}\n${_sortBy(rows, 1).join('\n')}`;
  return new Blob([csv], { type: typeCSV });
}

/**
 * Generate Alerts Priority - Admin Areas Level - CSV file
 * @param {Object} state - Currently selected list state
 * @returns {Blob} blob - Return Alerts Priority - Admin Areas Level CSV
 */
function generate_AlertsPriorities_AdminAreasLevel_Csv(state) {
  const { rawData, selectedList, selectedAlert, selectedTimeframe } = state;
  const { dissolvedGeoJSON } = rawData;

  const alertTypeText = dictionary.alertType_alertText[selectedAlert];
  const geojson = applyTimeframeFilter(cloneDeep(dissolvedGeoJSON), selectedTimeframe);
  const { start, end } = getTimeframeBoundaries(selectedTimeframe);

  const rows = geojson.features.map((feature) => {
    const listName = selectedList.list_name;
    const subStateName = getFeatureRowValueByColumnName(feature, COLUMN__SUB_STATE);
    const stateName = getFeatureRowValueByColumnName(feature, COLUMN__STATE);
    const countryName = getFeatureRowValueByColumnName(feature, COLUMN__COUNTRY);
    const startDate = start;
    const endDate = end;

    /**
     * Sum feature Densities for selected admin Level
     * @param {Number} currentDensity - Density count for current feature
     * @param {Object} adminLevelObject - Sum of all alerts for admin level
     * @param {String} adminLevelName - Name of admin
     */
    const sumFeatureDensityForAdminLevel = (currentDensity, adminLevelObject, adminLevelName) => {
      const countsObjectCurrentDensityValue = adminLevelObject[adminLevelName] || 0;
      adminLevelObject[adminLevelName] = countsObjectCurrentDensityValue + currentDensity;
    };

    sumFeatureDensityForAdminLevel(feature.properties.umd, subStateCounts.density, subStateName);
    sumFeatureDensityForAdminLevel(feature.properties.umd, stateCounts.density, stateName);
    sumFeatureDensityForAdminLevel(feature.properties.umd, countryCounts.density, countryName);

    return [
      listName,
      subStateName,
      stateName,
      countryName,
      alertTypeText,
      selectedTimeframe,
      startDate,
      endDate,
    ];
  });

  const headers = [
    'List Name',
    'Sub State',
    'State',
    'Country',
    'Alert Type',
    'Timeframe',
    'Start Date',
    'End Date',
    'Current Density of Sub State Level Alerts (Alerts / 1000 ha)',
    'Current Density of State Level Alerts (Alerts / 1000 ha)',
    'Current Density of Country Level Alerts (Alerts / 1000 ha)',
  ];

  rows.map((row) => {
    row.push(subStateCounts.alerts[row[1]] / subStateCounts.density[row[1]]);
    row.push(stateCounts.alerts[row[2]] / stateCounts.density[row[2]]);
    row.push(countryCounts.alerts[row[3]] / countryCounts.density[row[3]]);
  });

  const uniqueRows = _uniqBy(rows, (item) => JSON.stringify(item));
  const csv = `${headers.join(',')}\n${_sortBy(uniqueRows, [3, 2, 1]).join('\n')}`;
  return new Blob([csv], { type: typeCSV });
}

/**
 * Generate Alerts Priority - Locations Level - CSV file
 * @param {Object} state - Currently selected list state
 * @returns {Blob} blob - Return Alerts Priority - Locations Level CSV
 */
function generate_AlertsPriorities_LocationsLevel_Csv(state) {
  const { rawData, selectedList, selectedAlert, selectedTimeframe } = state;

  const alertTypeText = dictionary.alertType_alertText[selectedAlert];
  const selectedProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];
  const selectedCoverageProperty = dictionary.alertType_featureCoverageProperty[selectedAlert];
  const geojson = applyTimeframeFilter(cloneDeep(rawData.geojson), selectedTimeframe);
  const { start, end } = getTimeframeBoundaries(selectedTimeframe);

  const rows = geojson.features.map((feature) => {
    const selectedData = feature.properties[selectedProperty];
    const hasAlerts = feature.properties[selectedCoverageProperty] === true;
    let featureAlertTotal = 0;
    if (selectedAlert === 'GLAD') {
      featureAlertTotal = selectedData.reduce((acc, val) => acc + val.count, 0);
    } else {
      //VIIRS
      featureAlertTotal = Object.values(selectedData)
        .map((arr) => arr.reduce((total, element) => total + element.count, 0))
        .reduce((featureTotal, el) => featureTotal + el, 0);
    }
    const density = featureAlertTotal / feature.properties.umd;
    const value = isNaN(density) ? 'N/a' : density;

    const listName = selectedList.list_name;
    const locationName = getFeatureRowValueByColumnName(feature, COLUMN__LOCATION_NAME);
    const subStateName = getFeatureRowValueByColumnName(feature, COLUMN__SUB_STATE);
    const stateName = getFeatureRowValueByColumnName(feature, COLUMN__STATE);
    const countryName = getFeatureRowValueByColumnName(feature, COLUMN__COUNTRY);
    const startDate = start;
    const endDate = end;
    const currentDensity = hasAlerts ? value : 'N/a';

    return [
      listName,
      locationName,
      subStateName,
      stateName,
      countryName,
      alertTypeText,
      selectedTimeframe,
      startDate,
      endDate,
      currentDensity,
    ];
  });

  const headers = [
    'List Name',
    'Location Name',
    'Sub State',
    'State',
    'Country',
    'Alert Type',
    'Timeframe',
    'Start Date',
    'End Date',
    'Current Density of Location Level Alerts (Alerts / 1000 ha)',
  ];

  const csv = `${headers.join(',')}\n${_sortBy(rows, 1).join('\n')}`;
  return new Blob([csv], { type: typeCSV });
}

/**
 * Generate - Alerts Summary - CSV file
 * @param {Object} state - Currently selected list state
 * @returns {Blob} blob - Return Alerts Summary CSV
 */
function generate_AlertsSummary_Csv(state) {
  const { rawData, selectedList, selectedAlert, selectedTimeframe } = state;
  const { geojson, dissolvedGeoJSON, failedGeoJSON } = rawData;

  const selectedProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];
  const selectedAlertsProperty = dictionary.alertType_featureCoverageProperty[selectedAlert];
  const filteredLocationGeoJSON = applyTimeframeFilter(cloneDeep(geojson), selectedTimeframe);
  const filteredDissolvedGeoJSON = applyTimeframeFilter(
    cloneDeep(dissolvedGeoJSON),
    selectedTimeframe
  );
  const locationsWithinAlerts = filteredLocationGeoJSON.features.reduce(
    (a, feature) => a + (feature.properties[selectedAlertsProperty] ? 1 : 0),
    0
  );
  const locationsWithAlerts = filteredLocationGeoJSON.features.reduce(
    (a, feature) => a + (Object.keys(feature.properties[selectedProperty]).length > 0 ? 1 : 0),
    0
  );
  const percentageWithAlerts = (locationsWithAlerts / locationsWithinAlerts) * 100;

  const listName = selectedList.list_name;
  const selectedAlertText = dictionary.alertType_alertText[selectedAlert];
  const totalLocations = filteredLocationGeoJSON.features.length + failedGeoJSON.features.length;
  const totalLocationsWithAlertsData = locationsWithinAlerts;

  let totalAlerts = 0;
  if (selectedAlert === 'GLAD') {
    totalAlerts = filteredDissolvedGeoJSON.features
      .map((f) => f.properties[selectedProperty])
      .flat()
      .reduce((acc, curr) => curr.count + acc, 0);
  } else {
    totalAlerts = filteredDissolvedGeoJSON.features.reduce((acc, feature) => {
      const selectedData = feature.properties.fireTimeframe;
      const featureAlertTotal = Object.values(selectedData)
        .map((arr) => arr.reduce((total, element) => total + element.count, 0))
        .reduce((featureTotal, el) => featureTotal + el, 0);
      return acc + featureAlertTotal;
    }, 0);
  }

  const rows = [
    listName,
    selectedAlertText,
    selectedTimeframe,
    totalLocations,
    totalLocationsWithAlertsData,
    locationsWithAlerts,
    percentageWithAlerts,
    totalAlerts,
  ];

  const headers = [
    'List(s)',
    'Alert Type',
    'Timeframe',
    'Total Locations with alerts data',
    'Total Locations',
    'Locations with Alerts',
    'Percentage Locations with Alerts of All Locations',
    'Number of Alerts',
  ];

  const csv = `${headers.join(',')}\n${rows.join(',')}`;
  return new Blob([csv], { type: typeCSV });
}

/**
 * @desc Download all ZIP compressed CSV files
 */
function downloadDashboard() {
  // Redux state
  const state = store.getState();
  const { selectedList } = state;

  // Generate each CSV
  const alertsAdminAreasLevelCsv = generate_Alert_AdminAreasLevel_Csv(state);
  const alertsLocationsLevelCsv = generate_Alerts_LocationsLevel_Csv(state);
  const alertsHistoryCsv = generate_AlertsHistory_Csv(state);
  const alertsPrioritiesAdminAreasLevelCsv = generate_AlertsPriorities_AdminAreasLevel_Csv(state);
  const alertsPrioritiesLocationsLevelCsv = generate_AlertsPriorities_LocationsLevel_Csv(state);
  const alertsSummaryCsv = generate_AlertsSummary_Csv(state);

  // Adding CSV files to JSZip instance
  const zip = new JSZip();
  zip.file('Alerts_AdminAreasLevel.csv', alertsAdminAreasLevelCsv);
  zip.file('Alerts_LocationsLevel.csv', alertsLocationsLevelCsv);
  zip.file('AlertsHistory.csv', alertsHistoryCsv);
  zip.file('AlertsPriorities_AdminAreasLevel.csv', alertsPrioritiesAdminAreasLevelCsv);
  zip.file('AlertsPriorities_LocationsLevel.csv', alertsPrioritiesLocationsLevelCsv);
  zip.file('AlertsSummary.csv', alertsSummaryCsv);

  // Creating ZIP file
  const promise = zip.generateAsync({ type: 'blob' });
  promise.then((res) => {
    saveAs(res, `dashboard-${selectedList.list_name}.zip`);
  });

  /**
   * @desc Reset alerts and density totals for admin levels
   */
  subStateCounts = {
    alerts: {},
    density: {},
  };
  stateCounts = {
    alerts: {},
    density: {},
  };
  countryCounts = {
    alerts: {},
    density: {},
  };

  gtag('event', 'Download button clicked', {
    event_category: 'Dashboard Download',
    event_label: 'user downloaded dashboard data',
  });
}

module.exports = {
  applyTimeframeFilter,
  applyLocationFilter,
  applyTimeframeFilterRemix,
  downloadDashboard,
};
