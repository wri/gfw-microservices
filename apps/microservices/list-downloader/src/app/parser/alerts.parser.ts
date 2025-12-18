import { groupBy } from 'lodash';
import { isWithinInterval, isBefore, isAfter, subMonths, subYears } from 'date-fns';
import {
  dictionary,
  COLUMN_LOCATION_NAME,
  COLUMN_SUB_STATE,
  COLUMN_STATE,
  COLUMN_COUNTRY,
} from '../shared/alert.utils';

export function getGladDaily(feature, momentStart: Date, momentEnd: Date) {
  return feature.glad_alerts_daily.filter((date) => {
    return isWithinInterval(new Date(date.day), { start: momentStart, end: momentEnd });
  });
}

export function getGladMonthlyMonth(feature, momentStart: Date, momentEnd: Date) {
  return feature.glad_alerts_monthly.filter((date) => {
    return isWithinInterval(new Date(date.day), { start: momentStart, end: momentEnd });
  });
}

export function getGladMonthlyQuarter(feature, momentEnd: Date) {
  const momentStart = subMonths(momentEnd, 2);

  return feature.glad_alerts_monthly.filter((date) => {
    return isWithinInterval(new Date(date.day), { start: momentStart, end: momentEnd });
  });
}

export function getGladMonthlyYear(feature, momentEnd: Date) {
  const momentStart = subYears(momentEnd, 1);

  return feature.glad_alerts_monthly.filter((date) => {
    return isWithinInterval(new Date(date.day), { start: momentStart, end: momentEnd });
  });
}

export function getViirsGrouped(feature, momentStart: Date, momentEnd: Date) {
  return groupBy(feature.viirs_alerts_daily, (alert) => {
    const alertMoment = new Date(alert.day);
    if (isBefore(alertMoment, momentStart) || isAfter(alertMoment, momentEnd)) {
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
