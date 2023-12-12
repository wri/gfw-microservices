import {
  TOGGLE_LAYER,
  TURN_LAYER_ON,
  TURN_LAYER_OFF,
  REMOVE_EXCLUSIVE_LAYERS,
  POPULATE_LAYERS,
  SHOW_LOADING,
  SHOW_MAP_LOADER,
  GET_LAYER_INFO,
  UPDATE_GFW_LOCATIONS,
  SHOW_LAYER_INFO,
  SHOW_BASEMAP_INFO,
  SET_FIRE_DAYS,
  UPDATE_ADMIN_SELECTIONS,
  TOGGLE_CANOPY_MODAL,
  UPDATE_LANDSAT_YEAR,
  TOGGLE_DRAW_SHAPE_NOTE_DETAILS_MODAL,
  TOGGLE_DRAWING,
  TOGGLE_SEARCH,
  TOGGLE_PANELS,
  UPDATE_CANOPY_DENSITY,
  UPDATE_ANALYSIS,
  ADD_LIST,
  REMOVE_LIST,
  RESET_LIST,
  SHOW_LISTS,
  SAVE_SKETCH_TOOL,
  UPDATE_PLANET_TILE_LAYER,
  UPDATE_PLANET_TILE_COLOR,
  UPDATE_SOY_YEAR,
  TOGGLE_HIGH_CONFIDENCE_ALERTS_FOR_INTEGRATED_ALERTS_LAYER,
  TOGGLE_HIGH_CONFIDENCE_ALERTS_FOR_RADD_ALERTS_LAYER,
} from '../constants/actionTypes';

export function populateLayers(data) {
  return { type: POPULATE_LAYERS, data };
}

export function toggleLayer(data) {
  return { type: TOGGLE_LAYER, data };
}

export function turnLayerOn(data) {
  return { type: TURN_LAYER_ON, data };
}

export function turnLayerOff(data) {
  return { type: TURN_LAYER_OFF, data };
}

export function removeExclusiveLayers(data) {
  return { type: REMOVE_EXCLUSIVE_LAYERS, data };
}

export function showLoading(data) {
  return { type: SHOW_LOADING, data };
}

export function showMapLoader(data) {
  return { type: SHOW_MAP_LOADER, data };
}

export function getLayerInfo(data) {
  return { type: GET_LAYER_INFO, data };
}

export function updateAdminSelections(data) {
  return { type: UPDATE_ADMIN_SELECTIONS, data };
}

export function updateGFWLocations(data) {
  return { type: UPDATE_GFW_LOCATIONS, data };
}

export function showLayerInfo(data) {
  return { type: SHOW_LAYER_INFO, data };
}

export function showBasemapInfo(data) {
  return { type: SHOW_BASEMAP_INFO, data };
}

export function showLists(data) {
  return { type: SHOW_LISTS, data };
}

export function toggleCanopyModal(data) {
  return { type: TOGGLE_CANOPY_MODAL, data };
}

export function toggleDrawShapeNoteDetailsModal() {
  return { type: TOGGLE_DRAW_SHAPE_NOTE_DETAILS_MODAL };
}

export function toggleSearch(data) {
  return { type: TOGGLE_SEARCH, data };
}

export function togglePanels(data) {
  return { type: TOGGLE_PANELS, data };
}

export function toggleDrawing(data) {
  return { type: TOGGLE_DRAWING, data };
}

export function setFireDays(data) {
  return { type: SET_FIRE_DAYS, data };
}

export function updateCanopyDensity(data) {
  return { type: UPDATE_CANOPY_DENSITY, data };
}

export function updateAnalysis(data) {
  return { type: UPDATE_ANALYSIS, data };
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

export function saveSketchTool(sketchTool) {
  return { type: SAVE_SKETCH_TOOL, sketchTool };
}

export function updateLandsatYear(data) {
  return { type: UPDATE_LANDSAT_YEAR, data };
}

export function updateSoyYear(data) {
  return { type: UPDATE_SOY_YEAR, data };
}

export function updatePlanetTileLayer(data) {
  return { type: UPDATE_PLANET_TILE_LAYER, data };
}

export function updatePlanetTileColor(data) {
  return { type: UPDATE_PLANET_TILE_COLOR, data };
}

export function toggleHighConfidenceAlertsForIntegratedAlertsLayer(data) {
  return { type: TOGGLE_HIGH_CONFIDENCE_ALERTS_FOR_INTEGRATED_ALERTS_LAYER, data };
}

export function toggleHighConfidenceAlertsForRaddAlertsLayer(data) {
  return { type: TOGGLE_HIGH_CONFIDENCE_ALERTS_FOR_RADD_ALERTS_LAYER, data };
}
