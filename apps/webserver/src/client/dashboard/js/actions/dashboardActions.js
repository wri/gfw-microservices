import * as types from './actionTypes';

export function addListCache(object) {
  return {
    type: types.ADD_LIST_CACHE,
    object,
  };
}

export function addGeometryCache(object) {
  return {
    type: types.ADD_GEOMETRY_CACHE,
    object,
  };
}

export function saveUserLists(lists) {
  return {
    type: types.SAVE_USERLISTS,
    lists,
  };
}

export function saveView(view) {
  return {
    type: types.SAVE_VIEW,
    view,
  };
}

export function saveMap(map) {
  return {
    type: types.SAVE_MAP,
    map,
  };
}

export function saveRawData(data) {
  return {
    type: types.SAVE_RAW_DATA,
    data,
  };
}

export function saveAccessLevel(level) {
  return {
    type: types.SAVE_ACCESS_LEVEL,
    level,
  };
}

export function saveLocationCount(counts) {
  return {
    type: types.SAVE_LOCATION_COUNT,
    counts,
  };
}

export function selectList(list) {
  return {
    type: types.SELECT_LIST,
    list,
  };
}

export function selectAlert(alert) {
  gtag('event', 'Dashboard alert type dropdown clicked', {
    ''event_category'': 'Dashboard Click',
    ''event_label'': 'user switched the dashboard alert type (Deforestation (GLAD), Fires (VIIRS))',
  });
  return {
    type: types.SELECT_ALERT,
    alert,
  };
}

export function selectTimeframe(timeframe) {
  gtag('event', 'Dashboard timeframe radio button clicked', {
    ''event_category'': 'Dashboard Click',
    ''event_label'': 'user changed the dashboard timeframe (week, month, quarter, year)',
  });
  return {
    type: types.SELECT_TIMEFRAME,
    timeframe,
  };
}

export function selectAdmin(admin) {
  return {
    type: types.SELECT_ADMIN,
    admin,
  };
}

export function updateLocationFilter(filter) {
  return {
    type: types.UPDATE_LOCATION_FILTER,
    filter,
  };
}

export function incrementZoomLevel() {
  return { type: types.INCREMENT_ZOOM };
}

export function resetZoomLevel() {
  return { type: types.RESET_ZOOM };
}

export function toggleLoader() {
  return { type: types.TOGGLE_LOADER };
}

export function toggleDialog(content) {
  return {
    type: types.TOGGLE_DIALOG,
    content,
  };
}

export function updateInfoBubbleCache(infoBubbleId, data) {
  return { type: types.UPDATE_INFO_BUBBLE_CACHE, infoBubbleId, data };
}

export function saveGFWLists(lists) {
  return { type: types.SAVE_GFWLISTS, lists };
}

export function setZoomLevelTotal(zoomLevelTotal) {
  return {
    type: types.ZOOM_LEVEL_TOTAL,
    zoomLevelTotal,
  };
}
