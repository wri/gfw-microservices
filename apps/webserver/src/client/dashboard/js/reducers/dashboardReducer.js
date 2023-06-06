import { combineReducers } from 'redux';
import cloneDeep from 'lodash/cloneDeep';

import {
  addListCache,
  saveUserLists,
  saveGFWLists,
  saveRawData,
  saveAccessLevel,
  saveLocationCount,
  selectList,
  selectAlert,
  selectTimeframe,
  toggleLoader,
  saveDialogContent,
  showDialog,
  zoomLevelTotal,
} from './listReducer';

import {
  addGeometryCache,
  saveView,
  saveMap,
  selectAdmin,
  updateMapTitle,
  updateLocationFilter,
  updateZoomLevel,
  updateInfoBubbleCache,
} from './mapReducer';

import dataReducer from './dataReducer';
import {
  timeframeFilterDissolved,
  timeframeFilterGeojson,
  timeframeFilterGeojsonForFooter,
} from './timeframeReducer';

const combinedReducers = combineReducers({
  accessLevel: saveAccessLevel,
  locationCount: saveLocationCount,
  userLists: saveUserLists,
  gfwLists: saveGFWLists,
  selectedList: selectList,
  selectedAlert: selectAlert,
  selectedTimeframe: selectTimeframe,
  selectedAdmin: selectAdmin,
  view: saveView,
  map: saveMap,
  mapTitle: updateMapTitle,
  locationFilters: updateLocationFilter,
  rawData: saveRawData,
  zoomLevel: updateZoomLevel,
  showLoader: toggleLoader,
  showDialog: showDialog,
  dialogContent: saveDialogContent,
  listCache: addListCache,
  geometryCache: addGeometryCache,
  infoBubbleCache: updateInfoBubbleCache,
  zoomLevelTotal: zoomLevelTotal,
});

// Cross Slice Reducers
/**
 * Created cross slice reducers to determine data for dashboard
 * @param {Object} intermediateState - Intermediate State object
 * @param {Object} previousState - Previous State object
 * @param {Object} action - Action
 * @returns {Object}
 */
function crossSliceReducer(intermediateState, previousState, action) {
  const { rawData } = intermediateState;
  const clonedRawData = cloneDeep(rawData);

  return {
    ...intermediateState,
    data: dataReducer(intermediateState, previousState, action, clonedRawData),
    timeframeGeojson: timeframeFilterGeojson(
      intermediateState,
      previousState,
      action,
      clonedRawData
    ),
    timeframeGeojsonForFooter: timeframeFilterGeojsonForFooter(
      intermediateState,
      previousState,
      action,
      clonedRawData
    ),
    timeframeDissolved: timeframeFilterDissolved(
      intermediateState,
      previousState,
      action,
      clonedRawData
    ),
  };
}

export default function rootReducer(state, action) {
  const intermediateState = combinedReducers(state, action);
  return crossSliceReducer(intermediateState, state, action);
}
