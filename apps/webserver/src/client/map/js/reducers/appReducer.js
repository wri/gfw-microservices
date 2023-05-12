// @flow
import { combineReducers } from 'redux';

import {
  populateLayers,
  toggleLayer,
  showLoading,
  loadList,
  getLayerInfo,
  updateGFWLocations,
  showLayerInfo,
  showBasemapInfo,
  setFireDays,
  updateCanopyDensity,
  toggleCanopyModal,
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
  listLoading: loadList,
  modalLayerInfo: getLayerInfo,
  gfwListDef: updateGFWLocations,
  visibleLayerInfo: showLayerInfo,
  visibleBasemapInfo: showBasemapInfo,
  adminSelections: updateAdminSelections,
  drawingActive: toggleDrawing,
  searchVisible: toggleSearch,
  panelsVisible: togglePanels,
  canopyModalVisible: toggleCanopyModal,
  drawShapeNoteDetailsModalVisible: toggleDrawShapeNoteDetailsModal,
  canopyDensity: updateCanopyDensity,
  fireDays: setFireDays,
  analysisResults: updateAnalysis,
  selectedLists: updateList,
  listsVisible: showLists,
  activeAnalysis: analysisReducer.handleActiveAnalysis,
  adminArea: analysisReducer.handleAdminArea,
  gladDateRange: analysisReducer.handleGLADDates,
  raddDateRange: analysisReducer.handleRADDDates,
  biomassRange: analysisReducer.handleBiomassRange,
  formaDateRange: analysisReducer.handleFORMADates,
  terraIDateRange: analysisReducer.handleTerraIDates,
  analysisWarning: analysisReducer.toggleWarning,
  selectedAnalysis: analysisReducer.setAnalysis,
  gladConfirmed: analysisReducer.toggleGladConfirmed,
  raddLayers: analysisReducer.toggleRaddLayers,
  clarkLabsLayers: analysisReducer.toggleClarkLabsLayers,
  sketchTool: saveSketchTool,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    state = undefined; //passes in initialState by default!
  }
  return appReducer(state, action);
};

export default rootReducer;
