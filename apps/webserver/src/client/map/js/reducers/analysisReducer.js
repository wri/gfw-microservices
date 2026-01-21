/* eslint-disable default-param-last */
import * as actionTypes from '../constants/actionTypes';

const initialAnalysisState = {
  activeAnalysis: 'draw',
  adminArea: {},
  biomassRanges: {
    min: 0,
    max: 917,
  },
  player: false,
  analysisWarning: false,
  selectedAnalysis: '',
  clarkLabsLayers: false,
};

export function handleActiveAnalysis(state = initialAnalysisState.activeAnalysis, action) {
  return action.type === actionTypes.SET_ACTIVE_ANALYSIS ? action.analysis : state;
}

export function handleAdminArea(state = initialAnalysisState.adminArea, action) {
  return action.type === actionTypes.SET_ANALYSIS_ADMIN_AREA ? action.area : state;
}

export function handleBiomassRange(state = initialAnalysisState.biomassRanges, action) {
  switch (action.type) {
    case actionTypes.SET_BIOMASS_MIN_RANGE:
      return { ...state, min: parseInt(action.value, 10) };
    case actionTypes.SET_BIOMASS_MAX_RANGE:
      return { ...state, max: parseInt(action.value, 10) };
    default:
      return state;
  }
}

export function toggleWarning(state = initialAnalysisState.analysisWarning, action) {
  return action.type === actionTypes.TOGGLE_WARNING ? !state : state;
}

export function toggleClarkLabsLayers(state = initialAnalysisState.clarkLabsLayers, action) {
  return action.type === actionTypes.TOGGLE_CLARK_LABS_LAYERS ? !state : state;
}

export function setAnalysis(state = initialAnalysisState.selectedAnalysis, action) {
  return action.type === actionTypes.SET_ANALYSIS ? action.data : state;
}
