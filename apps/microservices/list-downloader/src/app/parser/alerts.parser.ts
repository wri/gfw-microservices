import { groupBy } from 'lodash';
import * as moment from 'moment';
import {
  dictionary,
  COLUMN_LOCATION_NAME,
  COLUMN_SUB_STATE,
  COLUMN_STATE,
  COLUMN_COUNTRY,
} from '../shared/alert.utils';

export function getGladDaily(feature, momentStart: moment.Moment, momentEnd: moment.Moment) {
  return feature.glad_alerts_daily.filter((date) => {
    return moment(date.day).isBetween(momentStart, momentEnd, 'days', '[]');
  });
}

export function getGladMonthlyMonth(feature, momentStart: moment.Moment, momentEnd: moment.Moment) {
  return feature.glad_alerts_monthly.filter((date) => {
    return moment(date.day).isBetween(momentStart, momentEnd, 'month', '[]');
  });
}

export function getGladMonthlyQuarter(feature, momentEnd: moment.Moment) {
  const momentStart = moment(momentEnd).subtract(2, 'month');

  return feature.glad_alerts_monthly.filter((date) => {
    return moment(date.day).isBetween(momentStart, momentEnd, 'month', '[]');
  });
}

export function getGladMonthlyYear(feature, momentEnd: moment.Moment) {
  const momentStart = moment(momentEnd).subtract(1, 'years');

  return feature.glad_alerts_monthly.filter((date) => {
    return moment(date.day).isBetween(momentStart, momentEnd, 'month', '[]');
  });
}

export function getViirsGrouped(feature, momentStart: moment.Moment, momentEnd: moment.Moment) {
  return groupBy(feature.viirs_alerts_daily, (alert) => {
    const alertMoment = moment(alert.day);
    if (alertMoment.isBefore(momentStart) || alertMoment.isAfter(momentEnd)) {
      return 'delete';
    } else {
      return alert.day;
    }
  });
}

const getFeatureRowValueByColumnName = function (feature, columnName) {
  if (feature[columnName]) {
    return feature[columnName].includes(',') ? `"${feature[columnName]}"` : feature[columnName];
  } else {
    return '';
  }
};

const basicLocationInfo = function (
  feature: Record<string, unknown>,
  selectedAlert: string
): string[] {
  const locationName = getFeatureRowValueByColumnName(feature, COLUMN_LOCATION_NAME);
  const subStateName = getFeatureRowValueByColumnName(feature, COLUMN_SUB_STATE);
  const stateName = getFeatureRowValueByColumnName(feature, COLUMN_STATE);
  const countryName = getFeatureRowValueByColumnName(feature, COLUMN_COUNTRY);
  const alertTypeText = dictionary.alertType_alertText[selectedAlert];
  const selectedCoverageProperty = dictionary.alertType_featureCoverageProperty[selectedAlert];

  return [
    locationName,
    subStateName,
    stateName,
    countryName,
    alertTypeText,
    selectedCoverageProperty,
  ];
};

export const generateAlertsPrioritiesLocationsLevel = (state: {
  feature: Record<string, unknown>;
  selectedAlert: string;
  selectedTimeframe: string;
  startDate: string;
  endDate: string;
  listName: string;
}) => {
  const { feature, selectedAlert, selectedTimeframe, startDate, endDate, listName } = state;

  const [
    locationName,
    subStateName,
    stateName,
    countryName,
    alertTypeText,
    selectedCoverageProperty,
  ] = basicLocationInfo(feature, selectedAlert);
  const hasAlerts = feature[selectedCoverageProperty] === true;
  const { featureAlertTotal, umd } = feature;

  const density = Number(featureAlertTotal) / Number(umd);
  const value = isNaN(density) ? 'N/a' : density;
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
};

export const generateAlertsLocationsLevel = (state: {
  feature: Record<string, unknown>;
  selectedAlert: string;
  selectedTimeframe: string;
  startDate: string;
  endDate: string;
  listName: string;
}) => {
  const { feature, selectedAlert, selectedTimeframe, startDate, endDate, listName } = state;

  const { featureAlertTotal } = feature;

  const [
    locationName,
    subStateName,
    stateName,
    countryName,
    alertTypeText,
    selectedCoverageProperty,
  ] = basicLocationInfo(feature, selectedAlert);

  const hasAlerts = feature[selectedCoverageProperty] === true;
  const alertPresent = hasAlerts ? featureAlertTotal : 'N/a';
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
    alertPresent,
  ];
};
