import {
  changeView,
  changeListView,
  changeAddType,
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
  toggleDeforestationDisplayFormat,
  toggleNaturalForestLossDataSource,
} from './locationReducer';
import { combineReducers } from 'redux';

const appReducer = combineReducers({
  view: changeView,
  language: setLanguage,
  listView: changeListView,
  addType: changeAddType,
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
  deforestationDisplayFormat: toggleDeforestationDisplayFormat,
  naturalForestLossDataSource: toggleNaturalForestLossDataSource,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    state = undefined;
  }
  const intermediateState = appReducer(state, action);

  return {
    ...intermediateState,
  };
};

export default rootReducer;
