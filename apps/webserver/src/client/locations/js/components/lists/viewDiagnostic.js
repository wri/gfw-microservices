/* eslint-disable import/prefer-default-export */
import axios from 'axios';

// Store
import store from '../../store';
import {
  changeView,
  resetList,
  updateListData,
  updateFilteredData,
  updateListLevelAnalysis,
  updateSelectedAndVisibleLocations,
  updateSelectedLocations,
  updateSpatialData,
} from '../../actions/locationActions';

// Config
import { gfwListNames } from '../../../../common/js/constants/lists.constants';
import getUserLocationDataFromAPI from './getUserLocationDataFromAPI';
import { dataCleanup } from '../../utils/lists.utils';

/**
 * @description - Get the GFW Pro list request data route
 * @param {boolean} isSingleLocation - Is single location (e.g. [true|false])
 * @return {string} - GFW Pro request data list route
 */
function getGfwProListDataRequestRoute(isSingleLocation = false) {
  const route = isSingleLocation
    ? '/locations/getGFWListLocationGeom'
    : '/locations/getGFWListLocationNoGeom';

  return route;
}

/**
 * @description - Get the User list request data route
 * @param {boolean} isSingleLocation - Is single location (e.g. [true|false])
 * @return {string} - Request data list route
 */
function getUserListDataRequestRoute(isSingleLocation = false) {
  const route = isSingleLocation ? '/locations/getUserListLocationSpatialData' : '/listDataCustom';

  return route;
}

export const viewDiagnostic = async (
  selectedList,
  history,
  filters = {},
  isSingleLocation = false,
  selectedLocations = [],
  listView = 'forest_change'
) => {
  const { id, list_name, list_locations_count } = selectedList;
  const isGFWList = gfwListNames.includes(list_name);
  const route = isGFWList
    ? getGfwProListDataRequestRoute(isSingleLocation)
    : getUserListDataRequestRoute(isSingleLocation);

  const requestDataParams = isGFWList
    ? {
        list_id: id,
        location_ids: isSingleLocation ? selectedLocations : [],
        rowsRequested: list_locations_count,
      }
    : {
        list_ids: [id],
        location_id: isSingleLocation ? selectedLocations[0] : 0,
        rowsRequested: isSingleLocation ? 1 : list_locations_count,
        columnsToReturn: isSingleLocation ? null : 'Latitude,Longitude,location_id',
        filters: isSingleLocation ? null : filters,
      };

  const axiosProps = {
    url: route,
    data: requestDataParams,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
  };

  const response = await axios(axiosProps);
  const { data } = response;

  //TODO this should be removed after we realize a refactor on the diagnostic page
  await fillListData(id, selectedList);

  if (!data?.errorCode) {
    if (isGFWList) {
      // Select all GFW Pro locations if list diagnostic was requested or no locations were selected
      if (selectedLocations.length === 0 || !isSingleLocation) {
        const locationIDs = data.map((location) => {
          return location.location_id;
        });

        store.dispatch(updateSelectedLocations(locationIDs));
        store.dispatch(updateSelectedAndVisibleLocations(locationIDs));
        store.dispatch(updateSpatialData([]));
      }

      if (isSingleLocation) {
        store.dispatch(updateSpatialData(data?.features || []));
      }
    } else if (isSingleLocation) {
      // Select single location if one location from list was selected
      store.dispatch(updateSpatialData(data ? data[0].features : []));
    } else {
      // Select all User locations if list diagnostic was requested or no locations were selected
      const locationIDs = [];
      const locationsSpatialFeatures = [];

      data
        .filter((location) => {
          return location.Latitude && location.Longitude;
        })
        .forEach((location) => {
          locationIDs.push(location.location_id);
          locationsSpatialFeatures.push({
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [location.Longitude, location.Latitude],
              type: 'Point',
            },
          });
        });
      store.dispatch(resetList(selectedList));
      store.dispatch(updateSelectedLocations(locationIDs));
      store.dispatch(updateSelectedAndVisibleLocations(locationIDs));
      store.dispatch(updateSpatialData(locationsSpatialFeatures));
    }

    store.dispatch(changeView('diagnostics'));

    gtag('event', 'View Diagnostic click', {
      event_category: 'List View Click',
      event_label: `user viewed ${listView} diagnostics for ${
        isSingleLocation ? 'a single location' : 'an entire list'
      }`,
    });

    history.push('/diagnostics');
  }

  return data;
};

const fillListData = async (listID, selectedList) => {
  const tableSortedBy = 'Investment Name';
  const tableSortedDesc = false;
  const filterString = '';
  const page = 0;
  const filters = {};

  const response = await getUserLocationDataFromAPI(filters, listID, filterString, tableSortedBy, tableSortedDesc, page);
  const {
    list_analysis,
    location_analyses,
  } = response;
  const listData = {
    list_analysis,
    location_analyses: [location_analyses, location_analyses],
  };
  processListData(listData, selectedList);
}

const processListData = (listData, selectedList) => {

  const { list_analysis, location_analyses } = listData;


  if (location_analyses) {
    // TODO - Talk to Lucas/Patrick, we should not be deleting data that is needed for Edit Lists workflow
    // If you need to hide the column, use a different method then deleting key/value
    const locationData = location_analyses[0];
    const analysisData = location_analyses[1];
    if (locationData.length > 0) {
      const data = setListData(locationData, analysisData, selectedList);

      const filteredIds = data.map((d) => d.location_id);
      store.dispatch(updateListData(data));
      store.dispatch(updateFilteredData(filteredIds));
      store.dispatch(updateListLevelAnalysis(list_analysis));
    }
  }
};

/**
 * Set all list data
 * @param {Array} locationData - All locations for selected list
 * @param {Array} analysisData - All analysis for selected list
 * @returns {Array} data - Return data based on selected list
 */
const setListData = (locationData, analysisData, selectedList) => {
  const data = [];
  locationData.forEach((loc) => {
    if (selectedList.list_name === 'Administrative Areas') {
      if (loc['Location Name']) {
        const splitsies = loc['Location Name'].split('--');
        if (splitsies.length > 0) {
          loc['Location Name'] = splitsies[splitsies.length - 1];
        }
      }
      if (loc['Investment Name']) {
        const splitsies = loc['Investment Name'].split('--');
        if (splitsies.length > 0) {
          loc['Investment Name'] = splitsies[splitsies.length - 1];
        }
      }
    }

    if (analysisData.length > 0) {
      let analysisList = [];
      if (
        selectedList.list_name === 'Protected Areas' ||
        selectedList.list_name === 'Administrative Areas'
      ) {
        // for protected areas and admin areas we dont match list_ids, just location ids
        [analysisList] = analysisData.filter(
          (analysis) => analysis.location_id === loc.location_id
        );
      } else {
        [analysisList] = analysisData.filter(
          (analysis) =>
            analysis.location_id === loc.location_id && analysis.list_id === loc.list_id
        );
      }
      data.push({ ...loc, ...analysisList });
    } else {
      data.push({ ...loc });
    }
  });
  return dataCleanup(data);
};
