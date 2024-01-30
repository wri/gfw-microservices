import * as types from '../actions/actionTypes';
import { applyTimeframeFilter, applyTimeframeFilterRemix } from '../utils/dashboard.utils';
import isEmpty from 'lodash/isEmpty';

function timeframeFilterDissolved(
  intermediateState = {},
  previousState = {},
  action,
  clonedRawData
) {
  const { timeframeDissolved } = previousState;
  const { selectedTimeframe } = intermediateState;
  const { dissolvedGeoJSON } = clonedRawData;
  switch (action.type) {
    case types.SELECT_ALERT:
    case types.SELECT_TIMEFRAME:
    case types.UPDATE_LOCATION_FILTER:
    case types.SAVE_RAW_DATA:
      if (isEmpty(clonedRawData)) {
        return {};
      } else {
        return applyTimeframeFilter(dissolvedGeoJSON, selectedTimeframe);
      }
    default:
      return typeof timeframeDissolved === 'undefined' ? {} : timeframeDissolved;
  }
}

function timeframeFilterGeojson(intermediateState = {}, previousState = {}, action, clonedRawData) {
  const { timeframeGeojson } = previousState;
  const { selectedTimeframe } = intermediateState;
  const { geojson } = clonedRawData;

  switch (action.type) {
    case types.SELECT_ALERT:
    case types.SELECT_TIMEFRAME:
    case types.UPDATE_LOCATION_FILTER:
    case types.SAVE_RAW_DATA:
      if (isEmpty(clonedRawData)) {
        return {};
      } else {
        return applyTimeframeFilter(geojson, selectedTimeframe);
      }
    default:
      return typeof timeframeGeojson === 'undefined' ? {} : timeframeGeojson;
  }
}

function timeframeFilterGeojsonForFooter(
  intermediateState = {},
  previousState = {},
  action,
  clonedRawData
) {
  const { timeframeGeojsonForFooter } = previousState;
  const { selectedTimeframe } = intermediateState;
  const { geojson } = clonedRawData;

  switch (action.type) {
    case types.SELECT_TIMEFRAME:
    case types.SELECT_ALERT:
    case types.SAVE_RAW_DATA:
      if (isEmpty(clonedRawData)) {
        return {};
      } else {
        return applyTimeframeFilterRemix(geojson, selectedTimeframe);
      }
    default:
      return typeof timeframeGeojsonForFooter === 'undefined' ? {} : timeframeGeojsonForFooter;
  }
}

module.exports = {
  timeframeFilterDissolved,
  timeframeFilterGeojson,
  timeframeFilterGeojsonForFooter,
};
