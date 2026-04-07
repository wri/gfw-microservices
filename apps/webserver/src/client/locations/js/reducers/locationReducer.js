import {
  CURRENT_VIEW,
  CURRENT_LIST_VIEW,
  SELECT_FOLDER,
  UPDATE_FOLDERS,
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
  UPDATE_INFO_BUBBLE_CACHE,
  TOGGLE_POPOVER,
  UPDATE_LOADING_ICON_ID,
  UPDATE_SELECTED_LIST,
  DEFORESTATION_DISPLAY_FORMAT,
  NATURAL_FOREST_LOSS_DATA_SOURCE,
  SHOW_INFO_POPOVER,
} from '../constants/actionTypes';
import cloneDeep from 'lodash/cloneDeep';
import infoBubbleConfig from '../../../common/js/infoBubbleConfig.constants';
import {
  DISPLAY_FORMAT_SUMMARY,
  SBTN_NATURAL_FOREST_LOSS,
} from '../../../listDetails/js/components/lists/ListDetails/deforestationDisplayFormat.constants';

const initialLocationState = {
  localColor: 'red',
  view: 'landing',
  listView: '',
  addType: null,
  addMethod: 'byAddress',
  activeTemplate: 'investment',
  language: 'en',
  locations: [],
  userFolders: [],
  selectedFolder: null,
  lists: [],
  gfwLists: [],
  sharedLists: [],
  selectedList: [],
  selectedLists: [],
  canopyModalVisible: false,
  filters: {},
  filterCount: 0,
  listData: [],
  spatialData: [],
  filteredData: [],
  selectedLocations: [],
  listLevelAnalysis: [],
  infoBubbleCache: {},
  popover: {
    displayPopover: false,
    popoverLoading: '',
    bubbleData: {},
    anchorEl: null,
  },
  deforestationDisplayFormat: DISPLAY_FORMAT_SUMMARY,
  naturalForestLossDataSource: SBTN_NATURAL_FOREST_LOSS,
};

// initialize infoBubleCache keys from config
Object.entries(infoBubbleConfig).forEach((entry) => {
  const infoBubbleId = entry[1];
  initialLocationState.infoBubbleCache[infoBubbleId] = null;
});

export function changeView(state = initialLocationState.view, action) {
  return action.type !== CURRENT_VIEW ? state : action.data;
}

export function changeListView(state = initialLocationState.listView, action) {
  return action.type !== CURRENT_LIST_VIEW ? state : action.data;
}

export function selectFolder(state = initialLocationState.selectedFolder, action) {
  return action.type !== SELECT_FOLDER ? state : action.data;
}

export function updateFolders(state = initialLocationState.userFolders, action) {
  return action.type !== UPDATE_FOLDERS ? state : action.data;
}

export function updatedSelectedList(state = initialLocationState.selectedList, action) {
  return action.type !== UPDATE_SELECTED_LIST ? state : action.data;
}

export function updateList(state = initialLocationState.selectedLists, action) {
  if (action.type === ADD_LIST) {
    return [...state, action.data];
  } else if (action.type === REMOVE_LIST) {
    return [...state.slice(0, action.data), ...state.slice(action.data + 1)];
  } else if (action.type === RESET_LIST) {
    if (action.data) {
      return [action.data];
    } else {
      return [];
    }
  } else {
    return state;
  }
}

export function toggleCanopyModal(state = initialLocationState.canopyModalVisible, action) {
  return action.type !== TOGGLE_CANOPY_MODAL ? state : !state;
}

export function updateFilters(state = initialLocationState.filters, action) {
  if (action.type === UPDATE_FILTERS) {
    //TODO: this is a hack to fix the issue of the filters not work on the second time, to solve has to change modal to functional components.
    return cloneDeep(action.data);
  } else if (action.type === CLEAR_FILTERS) {
    return {};
  } else {
    return state;
  }
}

export function setFilterCount(state = initialLocationState.filterCount, action) {
  return action.type !== SET_FILTER_COUNT ? state : action.data;
}

export function updateListData(state = initialLocationState.listData, action) {
  return action.type !== UPDATE_LIST_DATA ? state : action.data;
}

export function updateSpatialData(state = initialLocationState.spatialData, action) {
  if (action.type === UPDATE_SPATIAL_DATA) {
    action.data.forEach((feat) => {
      if (feat?.geometry?.coordinates && feat.geometry.coordinates.length > 0) {
        feat.geometry.coordinates.forEach((coord) => {
          if (coord.length & (coord.length > 0)) {
            coord.forEach((vertex) => {
              if (vertex.length && vertex.length === 2) {
                vertex[0] = parseFloat(vertex[0].toFixed(5));
                vertex[1] = parseFloat(vertex[1].toFixed(5));
              }
            });
          }
        });
      }
    });
    return action.data;
  } else {
    return state;
  }
}

export function updateFilteredData(state = initialLocationState.filteredData, action) {
  return action.type !== UPDATE_FILTERED_DATA ? state : action.data;
}

export function updateListLevelAnalysis(state = initialLocationState.listLevelAnalysis, action) {
  return action.type !== UPDATE_LIST_LEVEL_ANALYSIS ? state : action.data;
}

export function updateSelectedLocations(state = initialLocationState.selectedLocations, action) {
  return action.type !== UPDATE_SELECTED_LOCATIONS ? state : action.data;
}

export function updateSelectedAndVisibleLocations(state = [], action) {
  return action.type !== UPDATE_SELECTED_AND_VISIBLE_LOCATIONS ? state : action.data;
}

export function updateInfoBubbleCache(state = initialLocationState.infoBubbleCache, action) {
  const { type, infoBubbleId, data } = action;

  if (type !== UPDATE_INFO_BUBBLE_CACHE) {
    return state;
  }

  const newState = { ...state };
  newState[infoBubbleId] = data;
  return newState;
}

export function updatePopoverState(state = initialLocationState.popover, action) {
  const { type, displayPopover, popoverLoading, bubbleData, anchorEl } = action;

  switch (type) {
    case SHOW_INFO_POPOVER:
      return { displayPopover, popoverLoading, bubbleData, anchorEl };
    case TOGGLE_POPOVER:
      return {
        ...state,
        displayPopover,
      };
    case UPDATE_LOADING_ICON_ID:
      return {
        ...state,
        popoverLoading,
      };
    default:
      return state;
  }
}

export function setLanguage(state = initialLocationState.language, action) {
  return action.type !== SET_LANGUAGE ? state : action.data;
}

export function toggleDeforestationDisplayFormat(
  state = initialLocationState.deforestationDisplayFormat,
  action
) {
  return action.type !== DEFORESTATION_DISPLAY_FORMAT ? state : action.data;
}

export function toggleNaturalForestLossDataSource(
  state = initialLocationState.naturalForestLossDataSource,
  action
) {
  return action.type !== NATURAL_FOREST_LOSS_DATA_SOURCE ? state : action.data;
}
