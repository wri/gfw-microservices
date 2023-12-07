import {
  POPULATE_LAYERS,
  TOGGLE_LAYER,
  TURN_LAYER_ON,
  TURN_LAYER_OFF,
  REMOVE_EXCLUSIVE_LAYERS,
  SHOW_LOADING,
  SHOW_MAP_LOADER,
  UPDATE_ADMIN_SELECTIONS,
  GET_LAYER_INFO,
  UPDATE_GFW_LOCATIONS,
  SHOW_LAYER_INFO,
  SHOW_BASEMAP_INFO,
  SET_FIRE_DAYS,
  TOGGLE_CANOPY_MODAL,
  TOGGLE_DRAW_SHAPE_NOTE_DETAILS_MODAL,
  TOGGLE_DRAWING,
  TOGGLE_SEARCH,
  TOGGLE_PANELS,
  UPDATE_CANOPY_DENSITY,
  UPDATE_LANDSAT_YEAR,
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
import {
  mapPage,
  PLANET_TILE_LAYER_INITIAL,
  proLayers,
  soyPlantedYearsRange,
} from '../../../common/js/config';

const initialLocationState = {
  mapLayers: [],
  visibleLayers: mapPage.visibleLayers,
  addType: 'investment',
  iconLoading: '',
  listLoading: false,
  modalLayerInfo: '',
  visibleLayerInfo: {},
  gfwListDef: {},
  visibleBasemapInfo: '',
  drawingActive: false,
  adminSelections: {
    country: '',
    smallerRegion: '',
  },
  searchVisible: false,
  panelsVisible: true,
  canopyModalVisible: false,
  drawShapeNoteDetailsModalVisible: false,
  canopyDensity: 30,
  analysisResults: {},
  selectedLists: [],
  fireDays: 7,
  listsVisible: false,
  sketchTool: {},
  landsatYear: 2017,
  soyYear: soyPlantedYearsRange[1],
  planetTileLayer: PLANET_TILE_LAYER_INITIAL,
  planetTileColor: 'rgb',
  showHighConfidenceAlertsOnIntegratedAlertsLayer: false,
  showHighConfidenceAlertsOnRaddAlertsLayer: false,
};

export function populateLayers(state = initialLocationState.mapLayers, action) {
  return action.type !== POPULATE_LAYERS ? state : action.data;
}

export function toggleLayer(state = initialLocationState.visibleLayers, action) {
  if (action.type === TURN_LAYER_ON) {
    return [...state, action.data];
  }
  if (action.type === TURN_LAYER_OFF) {
    return state.filter((layer) => layer !== action.data);
  }
  if (action.type === REMOVE_EXCLUSIVE_LAYERS) {
    const newLayers = [];

    state.forEach((layer) => {
      if (!mapPage.exclusiveLayers.includes(layer)) {
        newLayers.push(layer);
      }
    });

    return newLayers;
  } else if (action.type === TOGGLE_LAYER) {
    if (typeof action.data !== 'string') {
      return action.data;
    } else {
      const newLayers = [];
      if (mapPage.exclusiveLayers.includes(action.data)) {
        state.forEach((layer) => {
          if (layer !== action.data && !mapPage.exclusiveLayers.includes(layer)) {
            newLayers.push(layer);
          }

          //Tree cover loss and Tree cover gain are exclusive but can be shown together
          if (
            (action.data === proLayers.treeCoverLossID && layer === proLayers.treeCoverGainID) ||
            (action.data === proLayers.treeCoverGainID && layer === proLayers.treeCoverLossID)
          ) {
            newLayers.push(layer);
          }

          //raddCoverage and raddAlerts are exclusive but can be shown together
          if (
            (action.data === proLayers.raddCoverageID && layer === proLayers.raddAlertsID) ||
            (action.data === proLayers.raddAlertsID && layer === proLayers.raddCoverageID)
          ) {
            newLayers.push(layer);
          }
        });
        if (!state.includes(action.data)) {
          newLayers.push(action.data);
        }
      } else {
        state.forEach((layer) => {
          if (layer !== action.data) {
            newLayers.push(layer);
          }
        });
        if (state.length === newLayers.length) {
          newLayers.push(action.data);
        }
      }
      return newLayers;
    }
  } else {
    return state;
  }
}

export function showLoading(state = initialLocationState.iconLoading, action) {
  return action.type !== SHOW_LOADING ? state : action.data;
}

export function showMapLoader(state = initialLocationState.listLoading, action) {
  return action.type !== SHOW_MAP_LOADER ? state : action.data;
}

export function toggleCanopyModal(state = initialLocationState.canopyModalVisible, action) {
  return action.type !== TOGGLE_CANOPY_MODAL ? state : !state;
}

export function toggleDrawShapeNoteDetailsModal(
  state = initialLocationState.drawShapeNoteDetailsModalVisible,
  action
) {
  return action.type !== TOGGLE_DRAW_SHAPE_NOTE_DETAILS_MODAL ? state : !state;
}

export function toggleSearch(state = initialLocationState.searchVisible, action) {
  return action.type !== TOGGLE_SEARCH ? state : !state;
}

export function togglePanels(state = initialLocationState.panelsVisible, action) {
  return action.type !== TOGGLE_PANELS ? state : !state;
}

export function updateCanopyDensity(state = initialLocationState.canopyDensity, action) {
  return action.type !== UPDATE_CANOPY_DENSITY ? state : action.data;
}

export function updateLandsatYear(state = initialLocationState.landsatYear, action) {
  return action.type !== UPDATE_LANDSAT_YEAR ? state : action.data;
}
export function updateSoyYear(state = initialLocationState.soyYear, action) {
  return action.type !== UPDATE_SOY_YEAR ? state : action.data;
}

export function updatePlanetTileLayer(state = initialLocationState.planetTileLayer, action) {
  return action.type !== UPDATE_PLANET_TILE_LAYER ? state : action.data;
}

export function updatePlanetTileColor(state = initialLocationState.planetTileColor, action) {
  return action.type !== UPDATE_PLANET_TILE_COLOR ? state : action.data;
}

export function getLayerInfo(state = initialLocationState.modalLayerInfo, action) {
  return action.type !== GET_LAYER_INFO ? state : action.data;
}

export function updateAdminSelections(state = initialLocationState.adminSelections, action) {
  return action.type !== UPDATE_ADMIN_SELECTIONS ? state : action.data;
}

export function setFireDays(state = initialLocationState.fireDays, action) {
  return action.type !== SET_FIRE_DAYS ? state : action.data;
}

export function updateAnalysis(state = initialLocationState.analysisResults, action) {
  return action.type !== UPDATE_ANALYSIS ? state : action.data;
}

export function showLayerInfo(state = initialLocationState.visibleLayerInfo, action) {
  return action.type !== SHOW_LAYER_INFO ? state : action.data;
}

export function updateGFWLocations(state = initialLocationState.gfwListDef, action) {
  return action.type !== UPDATE_GFW_LOCATIONS ? state : action.data;
}

export function showBasemapInfo(state = initialLocationState.visibleBasemapInfo, action) {
  return action.type !== SHOW_BASEMAP_INFO ? state : action.data;
}

export function showLists(state = initialLocationState.listsVisible, action) {
  return action.type !== SHOW_LISTS ? state : action.data;
}

export function toggleDrawing(state = initialLocationState.drawingActive, action) {
  return action.type !== TOGGLE_DRAWING ? state : !state;
}

export function updateList(state = initialLocationState.selectedLists, action) {
  if (action.type === ADD_LIST) {
    return [...state, action.data];
  } else if (action.type === REMOVE_LIST) {
    return [...state.slice(0, action.data), ...state.slice(action.data + 1)];
  } else if (action.type === RESET_LIST) {
    return [action.data];
  } else {
    return state;
  }
}

export function saveSketchTool(state = initialLocationState.sketchTool, action) {
  return action.type !== SAVE_SKETCH_TOOL ? state : action.sketchTool;
}

export function toggleHighConfidenceAlertsForIntegratedAlertsLayer(
  state = initialLocationState.showHighConfidenceAlertsOnIntegratedAlertsLayer,
  action
) {
  return action.type !== TOGGLE_HIGH_CONFIDENCE_ALERTS_FOR_INTEGRATED_ALERTS_LAYER ? state : !state;
}

export function toggleHighConfidenceAlertsForRaddAlertsLayer(
  state = initialLocationState.showHighConfidenceAlertsOnRaddAlertsLayer,
  action
) {
  return action.type !== TOGGLE_HIGH_CONFIDENCE_ALERTS_FOR_RADD_ALERTS_LAYER ? state : !state;
}
