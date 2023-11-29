import * as types from '../actions/actionTypes';
import merge from 'lodash/merge';
import { dashboardPage } from '../../../common/js/config';

const initialInfoBubbleCache = {};
// initialize infoBubleCache keys from config
Object.entries(dashboardPage.infoBubbleConfig).forEach((entry) => {
  const infoBubbleId = entry[1];
  initialInfoBubbleCache[infoBubbleId] = null;
});

export function addGeometryCache(state = {}, action) {
  return action.type === types.ADD_GEOMETRY_CACHE ? merge(state, action.object) : state;
}

export function saveView(state = {}, action) {
  return action.type === types.SAVE_VIEW ? action.view : state;
}

export function saveMap(state = {}, action) {
  return action.type === types.SAVE_MAP ? action.map : state;
}

export function selectAdmin(state = '', action) {
  switch (action.type) {
    case types.SELECT_ADMIN:
      return action.admin;
    case types.RESET_ZOOM:
      return '';
    default:
      return state;
  }
}

export function updateMapTitle(state = 'Last Week', action) {
  switch (action.type) {
    case types.SELECT_TIMEFRAME:
      const { timeframe } = action;
      switch (timeframe) {
        case 'DAY':
          return 'Yesterday';
        case 'WEEK':
          return 'Last Week';
        case 'MONTH':
          return 'Last Month';
        case 'QUARTER':
          return 'Last Quarter';
        case 'YEAR':
          return 'Last Year';
        default:
          return state;
      }
    default:
      return state;
  }
}

const initialFilter = {
  ALERTS: false,
  NOALERTS: false,
  FLAGGED: false,
};
export function updateLocationFilter(state = initialFilter, action) {
  return action.type === types.UPDATE_LOCATION_FILTER ? action.filter : state;
}

export function updateZoomLevel(state = 0, action) {
  switch (action.type) {
    case types.INCREMENT_ZOOM:
      if (state < 3) {
        return ++state;
      } else {
        return state;
      }
      break;
    case types.DECREMENT_ZOOM:
      if (state > 0) {
        return state-1;
      } else {
        return state;
      }
      break;
    case types.SELECT_LIST:
    case types.RESET_ZOOM:
      return 0;
    default:
      return state;
  }
}

export function updateInfoBubbleCache(state = initialInfoBubbleCache, action) {
  const { type, infoBubbleId, data } = action;

  if (type !== types.UPDATE_INFO_BUBBLE_CACHE) {
    return state;
  }

  const newState = { ...state };
  newState[infoBubbleId] = data;
  return newState;
}
