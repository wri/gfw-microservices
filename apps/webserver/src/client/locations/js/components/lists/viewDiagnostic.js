/* eslint-disable import/prefer-default-export */
import axios from 'axios';

// Store
import store from '../../store';
import {
  changeView,
  resetList,
  addList,
  updateSelectedAndVisibleLocations,
  updateSelectedLocations,
  updateSpatialData,
} from '../../actions/locationActions';

// Config
import { gfwListNames } from '../../../../common/js/constants/lists.constants';

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

    history.push('/diagnostics');

    gtag('event', 'View Diagnostic click', {
      event_category: 'List View Click',
      event_label: `user viewed ${listView} diagnostics for ${
        isSingleLocation ? 'a single location' : 'an entire list'
      }`,
    });
  }

  return data;
};
