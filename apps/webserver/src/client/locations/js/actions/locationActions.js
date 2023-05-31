import {
  CURRENT_VIEW,
  ADD_TYPE,
  ADD_METHOD,
  CHANGE_TEMPLATE,
  UPDATE_FOLDERS,
  SELECT_FOLDER,
  ADD_LIST,
  REMOVE_LIST,
  RESET_LIST,
  TOGGLE_CANOPY_MODAL,
  UPDATE_FILTERS,
  CLEAR_FILTERS,
  SET_FILTER_COUNT,
  SET_LANGUAGE,
  UPDATE_LIST_DATA,
  UPDATE_SPATIAL_DATA,
  UPDATE_FILTERED_DATA,
  UPDATE_LIST_LEVEL_ANALYSIS,
  UPDATE_SELECTED_LOCATIONS,
  UPDATE_SELECTED_AND_VISIBLE_LOCATIONS,
  CURRENT_LIST_VIEW,
  UPDATE_INFO_BUBBLE_CACHE,
  TOGGLE_POPOVER,
  UPDATE_LOADING_ICON_ID,
  UPDATE_BUBBLE_DATA,
  UPDATE_POPOVER_ANCHOR,
  UPDATE_SELECTED_LIST,
} from '../constants/actionTypes';

export function changeView(data) {
  return { type: CURRENT_VIEW, data };
}

export function changeListView(data) {
  return { type: CURRENT_LIST_VIEW, data };
}

export function changeAddType(data) {
  return { type: ADD_TYPE, data };
}

export function changeAddMethod(data) {
  return { type: ADD_METHOD, data };
}

export function changeTemplate(data) {
  gtag('event', 'Upload locations template radio button clicked', {
    'event_category': 'Upload Locations Select',
    'event_label': `user selected ${data} template for uploading locations`,
  });
  return { type: CHANGE_TEMPLATE, data };
}

export function updateFolders(data) {
  return { type: UPDATE_FOLDERS, data };
}

export function selectList(data) {
  return { type: UPDATE_SELECTED_LIST, data };
}

export function selectFolder(data) {
  return { type: SELECT_FOLDER, data };
}

export function addList(data) {
  return { type: ADD_LIST, data };
}

export function removeList(data) {
  return { type: REMOVE_LIST, data };
}

export function resetList(data) {
  return { type: RESET_LIST, data };
}

export function toggleCanopyModal(data) {
  return { type: TOGGLE_CANOPY_MODAL, data };
}

export function updateFilters(data) {
  return { type: UPDATE_FILTERS, data };
}

export function clearFilters(data) {
  return { type: CLEAR_FILTERS, data };
}

export function setFilterCount(data) {
  return { type: SET_FILTER_COUNT, data };
}

export function updateListData(data) {
  return { type: UPDATE_LIST_DATA, data };
}

export function updateSpatialData(data) {
  return { type: UPDATE_SPATIAL_DATA, data };
}

export function updateFilteredData(data) {
  return { type: UPDATE_FILTERED_DATA, data };
}

export function updateListLevelAnalysis(data) {
  return { type: UPDATE_LIST_LEVEL_ANALYSIS, data };
}

export function updateSelectedLocations(data) {
  return { type: UPDATE_SELECTED_LOCATIONS, data };
}

export function updateSelectedAndVisibleLocations(data) {
  return { type: UPDATE_SELECTED_AND_VISIBLE_LOCATIONS, data };
}

export function updateInfoBubbleCache(infoBubbleId, data) {
  return { type: UPDATE_INFO_BUBBLE_CACHE, infoBubbleId, data };
}

export function toggleInfoPopover(displayPopover) {
  return { type: TOGGLE_POPOVER, displayPopover };
}

export function updatePopoverLoadingId(popoverLoading) {
  return { type: UPDATE_LOADING_ICON_ID, popoverLoading };
}

export function updateBubbleData(bubbleData) {
  return { type: UPDATE_BUBBLE_DATA, bubbleData };
}

export function updatePopoverAnchorEl(anchorEl) {
  return { type: UPDATE_POPOVER_ANCHOR, anchorEl };
}

export function setLanguage(data) {
  return { type: SET_LANGUAGE, data };
}
