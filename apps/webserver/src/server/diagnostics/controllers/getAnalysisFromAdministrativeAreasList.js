const path = require('path');
const AnalysisManager = require(path.resolve('./config/publicutils/analysisManager.utils'));
const GFWListManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
const { GFW_LISTS_NUMBER_CONSTANTS } = require(path.resolve('./config/env/gfwLists.constants'));

const getAnalysisFromAdministrativeAreasList = async (req, locationId) => {
  const { ADMINISTRATIVE_AREAS } = GFW_LISTS_NUMBER_CONSTANTS;
  try {
    const listData = await GFWListManager.getAdministrativeAreasDataByLocationId(req, locationId);
    const protectedLocationResult = await AnalysisManager.getAnalysisDataForGFWList(
      req,
      ADMINISTRATIVE_AREAS,
      [locationId]
    );
    return {
      list_analysis: [],
      location_analyses: [listData[0], protectedLocationResult],
    };
  } catch (err) {
    console.warn('Error /getAnalysisFromAdministrativeAreasList', err);
    return err;
  }
};

module.exports = {
  getAnalysisFromAdministrativeAreasList,
};
