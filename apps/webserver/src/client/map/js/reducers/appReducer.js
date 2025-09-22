// @flow
import { combineReducers } from 'redux';

import {
  populateLayers,
  toggleLayer,
  showLoading,
  showMapLoader,
  getLayerInfo,
  updateGFWLocations,
  showLayerInfo,
  showBasemapInfo,
  setFireDays,
  updateCanopyDensity,
  updateTreeCoverLossCanopyDensity,
  toggleCanopyModal,
  toggleTreeCoverLossCanopyModal,
  updateLandsatYear,
  updateSoyYear,
  toggleDrawShapeNoteDetailsModal,
  toggleDrawing,
  toggleSearch,
  togglePanels,
  updateAnalysis,
  updateList,
  showLists,
  updateAdminSelections,
  saveSketchTool,
  updatePlanetTileLayer,
  updatePlanetTileColor,
  toggleHighConfidenceAlertsForDeforestationAlertsLayers,
  layerOpacity,
} from './mapReducer';
import * as analysisReducer from './analysisReducer';

const appReducer = combineReducers({
  mapLayers: populateLayers,
  landsatYear: updateLandsatYear,
  soyYear: updateSoyYear,
  planetTileLayer: updatePlanetTileLayer,
  planetTileColor: updatePlanetTileColor,
  visibleLayers: toggleLayer,
  iconLoading: showLoading,
  isMapLoading: showMapLoader,
  modalLayerInfo: getLayerInfo,
  gfwListDef: updateGFWLocations,
  visibleLayerInfo: showLayerInfo,
  visibleBasemapInfo: showBasemapInfo,
  adminSelections: updateAdminSelections,
  drawingActive: toggleDrawing,
  searchVisible: toggleSearch,
  panelsVisible: togglePanels,
  canopyModalVisible: toggleCanopyModal,
  treeCoverLossCanopyModalVisible: toggleTreeCoverLossCanopyModal,
  drawShapeNoteDetailsModalVisible: toggleDrawShapeNoteDetailsModal,
  canopyDensity: updateCanopyDensity,
  treeCoverLossCanopyDensity: updateTreeCoverLossCanopyDensity,
  fireDays: setFireDays,
  analysisResults: updateAnalysis,
  selectedLists: updateList,
  listsVisible: showLists,
  activeAnalysis: analysisReducer.handleActiveAnalysis,
  adminArea: analysisReducer.handleAdminArea,
  gladDateRange: analysisReducer.handleGLADDates,
  biomassRange: analysisReducer.handleBiomassRange,
  analysisWarning: analysisReducer.toggleWarning,
  selectedAnalysis: analysisReducer.setAnalysis,
  clarkLabsLayers: analysisReducer.toggleClarkLabsLayers,
  sketchTool: saveSketchTool,
  showHighConfidenceAlertsOnDeforestationAlertsLayer:
    toggleHighConfidenceAlertsForDeforestationAlertsLayers,
  layerOpacity: layerOpacity,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    state = undefined; //passes in initialState by default!
  }
  return appReducer(state, action);
};

export default rootReducer;
