/* eslint-disable default-param-last */
import * as actionTypes from '../constants/actionTypes';

const initialAnalysisState = {
  activeAnalysis: 'draw',
  adminArea: {},
  gladDates: {
    start: new Date('2021-01-01 00:00:00'),
    sliderDate: new Date('2021-01-01 00:00:00'),
    end: new Date(),
  },
  biomassRanges: {
    min: 0,
    max: 917,
  },
  player: false,
  analysisWarning: false,
  selectedAnalysis: '',
  gladConfirmed: false,
  raddLayers: false,
  clarkLabsLayers: false,
};

export function handleActiveAnalysis(state = initialAnalysisState.activeAnalysis, action) {
  return action.type === actionTypes.SET_ACTIVE_ANALYSIS ? action.analysis : state;
}

export function handleAdminArea(state = initialAnalysisState.adminArea, action) {
  return action.type === actionTypes.SET_ANALYSIS_ADMIN_AREA ? action.area : state;
}

export function handleGLADDates(state = initialAnalysisState.gladDates, action) {
  switch (action.type) {
    case actionTypes.SET_GLAD_START_DATE:
      return { ...state, start: action.date };
    case actionTypes.SET_GLAD_SLIDER_DATE:
      return { ...state, sliderDate: action.date };
    case actionTypes.SET_GLAD_END_DATE:
      return { ...state, end: action.date };
    default:
      return state;
  }
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

export function toggleGladConfirmed(state = initialAnalysisState.gladConfirmed, action) {
  return action.type === actionTypes.TOGGLE_GLAD ? !state : state;
}

export function toggleRaddLayers(state = initialAnalysisState.raddLayers, action) {
  return action.type === actionTypes.TOGGLE_RADD_LAYERS ? !state : state;
}

export function toggleClarkLabsLayers(state = initialAnalysisState.clarkLabsLayers, action) {
  return action.type === actionTypes.TOGGLE_CLARK_LABS_LAYERS ? !state : state;
}

export function setAnalysis(state = initialAnalysisState.selectedAnalysis, action) {
  return action.type === actionTypes.SET_ANALYSIS ? action.data : state;
}
