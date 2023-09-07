// @flow
import {
  changeView,
  changeListView,
  changeAddType,
  changeAddMethod,
  changeTemplate,
  updateFolders,
  selectFolder,
  updateList,
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
  setLanguage,
  updateListData,
  updateListLevelAnalysis,
  updateSpatialData,
  updateFilteredData,
  updateSelectedLocations,
  updateSelectedAndVisibleLocations,
  updateInfoBubbleCache,
  updatePopoverState,
} from './locationReducer';
import { combineReducers } from 'redux';

const appReducer = combineReducers({
  view: changeView,
  language: setLanguage,
  listView: changeListView,
  addType: changeAddType,
  addMethod: changeAddMethod,
  activeTemplate: changeTemplate,
  userFolders: updateFolders,
  selectedFolder: selectFolder,
  selectedLists: updateList,
  canopyModalVisible: toggleCanopyModal,
  filters: updateFilters,
  filterCount: setFilterCount,
  listData: updateListData,
  spatialData: updateSpatialData,
  filteredData: updateFilteredData,
  listLevelAnalysis: updateListLevelAnalysis,
  selectedLocations: updateSelectedLocations,
  selectedAndVisibleLocations: updateSelectedAndVisibleLocations,
  infoBubbleCache: updateInfoBubbleCache,
  popover: updatePopoverState,
});

function crossSliceReducer(intermediateState, previousState, action) {
  return {
    ...intermediateState,
  };
}

const rootReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    state = undefined;
  }
  const intermediateState = appReducer(state, action);
  return crossSliceReducer(intermediateState, state, action);
};

export default rootReducer;
