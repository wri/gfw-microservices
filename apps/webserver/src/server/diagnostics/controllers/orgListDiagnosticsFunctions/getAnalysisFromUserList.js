const path = require('path');
const { pick } = require('lodash');
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const AnalysisManager = require(path.resolve('./config/publicutils/analysisManager.utils'));
const LocationManager = require(path.resolve('./config/publicutils/locationManager.utils'));

module.exports = async function (req, selectedList) {
  const listId = Number(req.params.listId);
  const locationId = Number(req.body.locatonId);
  let listLocationsIds = locationId ? [locationId] : [];
  const { list_locations_count: rowsRequested } = selectedList;

  try {
    let spatialData;

    if (locationId) {
      const SINGLE_LOCATION_ROW_REQUESTED = 1;
      const [listLocationsData] = await ListManager.getListLocations(
        req,
        listId,
        SINGLE_LOCATION_ROW_REQUESTED
      );
      spatialData = listLocationsData ? listLocationsData?.features : [];
    } else {
      spatialData = [];

      /** @summary
       * ----------------------------------
       * this should be the same as
       * requesting post /listDataCustom
       * ----------------------------------
       */
      const DEFAULT_SELECTED_COUNTRY = '';
      const DEFAULT_COLUMNS_TO_RETURN = 'Latitude,Longitude,location_id';
      const DEFAULT_SELECTED_STATE = '';
      const DEFAULT_SELECTED_SUB_STATE = '';
      const DEFAULT_SELECTED_AREA_MIN = 0;
      const DEFAULT_SELECTED_AREA_MAX = null;

      const queryFilters = {
        listID: selectedList.id,
        orderType: 'asc',
        sortByAttribute: 'location_id',
        country: DEFAULT_SELECTED_COUNTRY,
        state: DEFAULT_SELECTED_STATE,
        subState: DEFAULT_SELECTED_SUB_STATE,
        analysisAreaMin: DEFAULT_SELECTED_AREA_MIN,
        analysisAreaMax: DEFAULT_SELECTED_AREA_MAX,
        columnsToReturn: DEFAULT_COLUMNS_TO_RETURN,
        pageSize: rowsRequested,
      };
      const listLocationsData = await ListManager.getPaginatedAnalysisDataForUserList(
        req,
        listId,
        queryFilters
      );

      /** @summary
       * picks locations colums
       * filter by locs with both lon && lat
       * adds locations to the locationsIds arrays
       * populates spatialData
       */
      const listLocationsDataFiltered = listLocationsData
        .map((location) => {
          const pickedLocationsColumns = ['list_id', ...DEFAULT_COLUMNS_TO_RETURN.split(',')];

          return pick(location, pickedLocationsColumns);
        })
        .filter((location) => {
          return location.Latitude && location.Longitude;
        });

      spatialData = listLocationsDataFiltered.map((location) => {
        // make sure we don't repeat the locationId
        if (!listLocationsIds.includes(location.location_id)) {
          listLocationsIds.push(location.location_id);
        }

        return {
          type: 'Feature',
          properties: {},
          geometry: {
            coordinates: [location.Longitude, location.Latitude],
            type: 'Point',
          },
        };
      });
    }

    const listAnalyses = await AnalysisManager.getListAnalyses(req, listId);

    const filters = {
      page: 1,
      pageSize: rowsRequested,
      orderType: 'desc',
      sortByAttribute: 'Investment Name',
      searchString: '',
    };
    const analysisDataForUserList = await ListManager.getPaginatedAnalysisDataForUserList(
      req,
      listId,
      filters
    );

    if (analysisDataForUserList?.length > 0) {
      const locationAttributeList = await LocationManager.getLocationAttributesList(
        req,
        analysisDataForUserList,
        false
      );
      return {
        spatialData,
        listLocationsIds,
        listAnalyses,
        locationAnalyses: [analysisDataForUserList, locationAttributeList],
      };
    } else {
      return {
        spatialData,
        listLocationsIds,
        listAnalyses,
        locationAnalyses: [],
      };
    }
  } catch (error) {
    console.warn('Error /getAnalysisFromUserList', error);
    return error;
  }
};
