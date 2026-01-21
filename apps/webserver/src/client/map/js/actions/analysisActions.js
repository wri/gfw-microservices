import * as actionTypes from '../constants/actionTypes';

// Dispatches action to set the active analysis in the analysis panel
export function setActiveAnalysis(analysis) {
  return { type: actionTypes.SET_ACTIVE_ANALYSIS, analysis };
}

export function setAnalysisAdminArea(area) {
  return { type: actionTypes.SET_ANALYSIS_ADMIN_AREA, area };
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

export function toggleClarkLabsLayers(data) {
  return { type: actionTypes.TOGGLE_CLARK_LABS_LAYERS, data };
}

export function setAnalysis(data) {
  return { type: actionTypes.SET_ANALYSIS, data };
}
