import * as types from '../actions/actionTypes';
import isEmpty from 'lodash/isEmpty';

export function addListCache(state = {}, action) {
  return action.type === types.ADD_LIST_CACHE ? Object.assign(state, action.object) : state;
}

export function saveUserLists(state = [], action) {
  return action.type === types.SAVE_USERLISTS ? action.lists : state;
}

export function saveGFWLists(state = [], action) {
  return action.type === types.SAVE_GFWLISTS ? action.lists : state;
}

export function saveRawData(state = {}, action) {
  return action.type === types.SAVE_RAW_DATA ? action.data : state;
}

export function saveAccessLevel(state = 3, action) {
  return action.type === types.SAVE_ACCESS_LEVEL ? action.level : state;
}

export function saveLocationCount(state = {}, action) {
  return action.type === types.SAVE_LOCATION_COUNT ? action.counts : state;
}

export function selectList(state = {}, action) {
  return action.type === types.SELECT_LIST ? action.list : state;
}

export function selectAlert(state = 'GLAD', action) {
  return action.type === types.SELECT_ALERT ? action.alert : state;
}

export function selectTimeframe(state = 'WEEK', action) {
  switch (action.type) {
    case types.SELECT_TIMEFRAME:
      return action.timeframe;
    case types.SELECT_ALERT:
      if (action.alert === 'GLAD') {
        return 'WEEK';
      } else {
        return 'DAY';
      }
    default:
      return state;
  }
}

export function toggleLoader(state = false, action) {
  return action.type === types.TOGGLE_LOADER ? !state : state;
}

export function showDialog(state = false, action) {
  if (action.type === types.TOGGLE_DIALOG) {
    return isEmpty(action.content) ? false : true;
  } else {
    return state;
  }
}

export function saveDialogContent(state = { title: '', body: '' }, action) {
  return action.type === types.TOGGLE_DIALOG ? action.content : state;
}

export function zoomLevelTotal(state = 0, action) {
  return action.type === types.ZOOM_LEVEL_TOTAL ? action.zoomLevelTotal : state;
}
