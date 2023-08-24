const path = require('path');
const AnalysisManager = require(path.resolve('./config/publicutils/analysisManager.utils'));
const LocationManager = require(path.resolve('./config/publicutils/locationManager.utils'));
const { GFW_LISTS_NUMBER_CONSTANTS } = require(path.resolve('./config/env/gfwLists.constants'));

const getAnalysisFromProtectedAreasList = async (req, locationId) => {
  const { PROTECTED_AREAS } = GFW_LISTS_NUMBER_CONSTANTS;
  try {
    const { listData, protectedLocationResult } =
      await AnalysisManager.getAnalysisDataForProtectedAreasByLocationId(
        req,
        PROTECTED_AREAS,
        locationId
      );

    return {
      list_analysis: [],
      location_analyses: [listData, protectedLocationResult],
    };
  } catch (err) {
    console.warn('Error /getAnalysisFromProtectedAreasList', err);
    return err;
  }
};

module.exports = {
  getAnalysisFromProtectedAreasList,
};
