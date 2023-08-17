const path = require('path');
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const AnalysisManager = require(path.resolve('./config/publicutils/analysisManager.utils'));
const LocationManager = require(path.resolve('./config/publicutils/locationManager.utils'));

const getAnalysisFromUserList = async (req, listId) => {
  const filters = {
    page: 1,
    pageSize: 50,
    orderType: 'desc',
    sortByAttribute: 'Investment Name',
    searchString: '',
  };

  try {
    const listAnalyses = await AnalysisManager.getListAnalyses(req, listId);

    const locationAttributeArray = await ListManager.getPaginatedAnalysisDataForUserList(
      req,
      listId,
      filters
    );

    if (locationAttributeArray?.length > 0) {
      const locationAttributeList = await LocationManager.getLocationAttributesList(
        req,
        locationAttributeArray,
        false
      );
      return {
        list_analysis: listAnalyses,
        location_analyses: [locationAttributeList, locationAttributeList],
      };
    } else {
      return {
        list_analysis: listAnalyses,
        location_analyses: [],
      };
    }
  } catch (err) {
    console.log('Failed', err);
    return err;
  }
};

module.exports = {
  getAnalysisFromUserList,
};
