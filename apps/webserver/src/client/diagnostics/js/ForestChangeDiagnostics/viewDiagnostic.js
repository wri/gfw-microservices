import axios from 'axios';
import { gfwListNames } from '../../../common/js/constants/lists.constants';

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
// TODO: remove me
export const viewDiagnostic = async (selectedList, selectedLocation = []) => {
  const isSingleLocation = selectedLocation.length;

  const { id, list_name, list_locations_count } = selectedList;
  const isGFWList = gfwListNames.includes(list_name);
  const route = isGFWList
    ? getGfwProListDataRequestRoute(isSingleLocation)
    : getUserListDataRequestRoute(isSingleLocation);

  const requestDataParams = isGFWList
    ? {
        list_id: id,
        location_ids: isSingleLocation ? selectedLocation : [],
        rowsRequested: list_locations_count,
      }
    : {
        list_ids: [id],
        location_id: isSingleLocation ? selectedLocation[0] : 0,
        rowsRequested: isSingleLocation ? 1 : list_locations_count,
        columnsToReturn: isSingleLocation ? null : 'Latitude,Longitude,location_id',
        filters: isSingleLocation ? null : {},
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

  let spatialData;

  let locationIDs = selectedLocation;
  if (!data?.errorCode) {
    if (isGFWList) {
      // Select all GFW Pro locations if list diagnostic was requested or no locations were selected
      if (!isSingleLocation) {
        locationIDs = data.map((location) => {
          return location.location_id;
        });
        spatialData = [];
      } else {
        spatialData = data?.features || [];
      }
    } else if (isSingleLocation) {
      spatialData = data ? data[0].features : [];
    } else {
      // Select all User locations if list diagnostic was requested or no locations were selected

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
      spatialData = locationsSpatialFeatures;
    }
  }

  return [spatialData, locationIDs];
};
