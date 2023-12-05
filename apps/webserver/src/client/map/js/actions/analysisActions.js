import * as actionTypes from '../constants/actionTypes';

// Dispatches action to set the active analysis in the analysis panel
export function setActiveAnalysis(analysis) {
  return { type: actionTypes.SET_ACTIVE_ANALYSIS, analysis };
}

export function setAnalysisAdminArea(area) {
  return { type: actionTypes.SET_ANALYSIS_ADMIN_AREA, area };
}

// Actions related to ad-hoc analysis for forest change layers
export function setGLADStartDate(date) {
  return { type: actionTypes.SET_GLAD_START_DATE, date };
}

export function setGLADSliderDate(date) {
  return { type: actionTypes.SET_GLAD_SLIDER_DATE, date };
}

export function setGLADEndDate(date) {
  return { type: actionTypes.SET_GLAD_END_DATE, date };
}

export function setBiomassMinRange(value) {
  return { type: actionTypes.SET_BIOMASS_MIN_RANGE, value };
}

export function setBiomassMaxRange(value) {
  return { type: actionTypes.SET_BIOMASS_MAX_RANGE, value };
}

export function toggleWarning(data) {
  return { type: actionTypes.TOGGLE_WARNING, data };
}

export function toggleGladConfirmed(data) {
  return { type: actionTypes.TOGGLE_GLAD, data };
}

export function toggleRaddLayers(data) {
  return { type: actionTypes.TOGGLE_RADD_LAYERS, data };
}

export function toggleClarkLabsLayers(data) {
  return { type: actionTypes.TOGGLE_CLARK_LABS_LAYERS, data };
}

export function setAnalysis(data) {
  return { type: actionTypes.SET_ANALYSIS, data };
}
