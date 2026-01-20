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
  TOGGLE_TREE_COVER_LOSS_CANOPY_MODAL,
  TOGGLE_DRAW_SHAPE_NOTE_DETAILS_MODAL,
  TOGGLE_DRAWING,
  TOGGLE_SEARCH,
  TOGGLE_PANELS,
  UPDATE_CANOPY_DENSITY,
  UPDATE_TREE_COVER_LOSS_CANOPY_DENSITY,
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
  TOGGLE_HIGH_CONFIDENCE_ALERTS_FOR_DEFORESTATION_ALERTS_LAYERS,
  SET_LAYER_OPACITY,
  UPDATE_DRIVER_OF_DISTURBANCE_ALERTS_FILTER,
  UPDATE_GLOBAL_VEGETATION_DISTURBANCE_ALERTS_FILTER,
  UPDATE_GLOBAL_INTEGRATED_DISTURBANCE_ALERTS_FILTER,
  UPDATE_PRODES_DEFORESTATION_FILTER,
  UPDATE_DEFORESTATION_ALERTS_DATE_RANGE,
} from '../constants/actionTypes';
import {
  PLANET_TILE_LAYER_INITIAL,
  soyPlantedYearsRange,
  dcfAlertsDateRange,
  deforestationAlertDateRange,
  mapPage,
} from '../../../common/js/config';
import {
  proLayers,
  exclusiveLayers,
  visibleLayers,
  DEFAULT_TREE_COVER_LOSS_CANOPY_DENSITY,
} from '../../../common/js/proLayers.config';

const DEFORESTATION_ALERT_LAYER_IDS = [
  proLayers.integratedDeforestationAlertsID,
  proLayers.raddAlertsID,
  proLayers.gladAlertsID,
  proLayers.gladS2AlertsID,
];

const buildDefaultDeforestationAlertDateRanges = () => {
  return DEFORESTATION_ALERT_LAYER_IDS.reduce((acc, layerId) => {
    acc[layerId] = deforestationAlertDateRange;
    return acc;
  }, {});
};

const initialLocationState = {
  mapLayers: [],
  visibleLayers,
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
  treeCoverLossCanopyModalVisible: false,
  drawShapeNoteDetailsModalVisible: false,
  canopyDensity: DEFAULT_TREE_COVER_LOSS_CANOPY_DENSITY,
  treeCoverLossCanopyDensity: 0,
  analysisResults: {},
  selectedLists: [],
  fireDays: 7,
  listsVisible: false,
  sketchTool: {},
  landsatYear: 2017,
  soyYear: soyPlantedYearsRange[1],
  planetTileLayer: PLANET_TILE_LAYER_INITIAL,
  planetTileColor: 'rgb',
  showHighConfidenceAlertsOnDeforestationAlertsLayer: false,
  layerOpacity: {}, // stores layers opacity { layerId1: 0.5, layerId2: 0.8 }
  driverOfDisturbanceAlertsFilter: {
    startDate: dcfAlertsDateRange.initialStart,
    endDate: dcfAlertsDateRange.max,
  },
  globalVegetationDisturbanceAlertsFilter: {
    startDate: dcfAlertsDateRange.initialStart,
    endDate: dcfAlertsDateRange.max,
    vegetationType: 'all-vegetation',
  },
  globalIntegratedDisturbanceAlertsFilter: {
    startDate: dcfAlertsDateRange.initialStart,
    endDate: dcfAlertsDateRange.max,
    vegetationType: 'all-vegetation',
    onlyHighConfidenceAlerts: false,
  },
  prodesDeforestationFilter: {
    startYear: mapPage.prodesLossYears[0],
    endYear: mapPage.prodesLossYears[mapPage.prodesLossYears.length - 1],
  },
  deforestationAlertsDateRanges: buildDefaultDeforestationAlertDateRanges(),
};

export function layerOpacity(state = initialLocationState.layerOpacity, action) {
  return action.type !== SET_LAYER_OPACITY
    ? state
    : {
        ...state,
        [action.data.layerId]: action.data.opacity,
      };
}

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
      if (!exclusiveLayers.includes(layer)) {
        newLayers.push(layer);
      }
    });

    return newLayers;
  } else if (action.type === TOGGLE_LAYER) {
    if (typeof action.data !== 'string') {
      return action.data;
    } else {
      const newLayers = [];
      if (exclusiveLayers.includes(action.data)) {
        state.forEach((layer) => {
          if (layer !== action.data && !exclusiveLayers.includes(layer)) {
            newLayers.push(layer);
          }

          //Tree cover loss and Tree cover gain are exclusive but can be shown together
          if (
            (action.data === proLayers.treeCoverLossID && layer === proLayers.treeCoverGainID) ||
            (action.data === proLayers.treeCoverGainID && layer === proLayers.treeCoverLossID)
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
        } else {
          // If removing disturbanceAlertsDriversId, also remove its geographic coverage layer
          if (action.data === proLayers.disturbanceAlertsDriversId) {
            const index = newLayers.indexOf(proLayers.disturbanceAlertsDriversGeographicCoverageId);
            if (index > -1) {
              newLayers.splice(index, 1);
            }
          }
          // If removing globalIntegratedDisturbanceAlertsId, also remove its geographic coverage layers
          if (action.data === proLayers.globalIntegratedDisturbanceAlertsId) {
            const globalVegIndex = newLayers.indexOf(
              proLayers.globalVegetationDisturbanceAlertsGeographicCoverageId
            );
            if (globalVegIndex > -1) {
              newLayers.splice(globalVegIndex, 1);
            }
            const integratedIndex = newLayers.indexOf(
              proLayers.integratedAlertsGeographicCoverageID
            );
            if (integratedIndex > -1) {
              newLayers.splice(integratedIndex, 1);
            }
          }
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
export function toggleTreeCoverLossCanopyModal(
  state = initialLocationState.treeCoverLossCanopyModalVisible,
  action
) {
  return action.type !== TOGGLE_TREE_COVER_LOSS_CANOPY_MODAL ? state : !state;
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
  return action.type !== UPDATE_CANOPY_DENSITY ? state : action.payload;
}

export function updateTreeCoverLossCanopyDensity(
  state = initialLocationState.treeCoverLossCanopyDensity,
  action
) {
  return action.type !== UPDATE_TREE_COVER_LOSS_CANOPY_DENSITY ? state : action.payload;
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

export function updateDriverOfDisturbanceAlertsFilter(
  state = initialLocationState.driverOfDisturbanceAlertsFilter,
  action
) {
  return action.type !== UPDATE_DRIVER_OF_DISTURBANCE_ALERTS_FILTER ? state : action.payload;
}
export function updateGlobalVegetationDisturbanceAlertsFilter(
  state = initialLocationState.globalVegetationDisturbanceAlertsFilter,
  action
) {
  return action.type !== UPDATE_GLOBAL_VEGETATION_DISTURBANCE_ALERTS_FILTER
    ? state
    : action.payload;
}
export function updateGlobalIntegratedDisturbanceAlertsFilter(
  state = initialLocationState.globalIntegratedDisturbanceAlertsFilter,
  action
) {
  return action.type !== UPDATE_GLOBAL_INTEGRATED_DISTURBANCE_ALERTS_FILTER
    ? state
    : action.payload;
}

export function updateProdesDeforestationFilter(
  state = initialLocationState.prodesDeforestationFilter,
  action
) {
  if (action.type !== UPDATE_PRODES_DEFORESTATION_FILTER) {
    return state;
  }

  const { startYear, endYear } = action.payload;
  if (state.startYear === startYear && state.endYear === endYear) {
    return state;
  }

  return action.payload;
}

export function toggleHighConfidenceAlertsForDeforestationAlertsLayers(
  state = initialLocationState.showHighConfidenceAlertsOnDeforestationAlertsLayer,
  action
) {
  return action.type !== TOGGLE_HIGH_CONFIDENCE_ALERTS_FOR_DEFORESTATION_ALERTS_LAYERS
    ? state
    : !state;
}

export function updateDeforestationAlertsDateRanges(
  state = initialLocationState.deforestationAlertsDateRanges,
  action
) {
  switch (action.type) {
    case UPDATE_DEFORESTATION_ALERTS_DATE_RANGE: {
      const { layerId, startDate, endDate } = action.payload || {};
      if (!layerId) {
        return state;
      }

      const currentRange = state[layerId] || deforestationAlertDateRange;
      const nextRange = { ...currentRange };
      let hasChanges = false;

      if (startDate && startDate !== currentRange.startDate) {
        nextRange.startDate = startDate;
        hasChanges = true;
      }

      if (endDate && endDate !== currentRange.endDate) {
        nextRange.endDate = endDate;
        hasChanges = true;
      }

      if (!hasChanges) {
        return state;
      }

      return {
        ...state,
        [layerId]: nextRange,
      };
    }
    default:
      return state;
  }
}
