const path = require('path');
const GFWListManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
const AnalysisManager = require(path.resolve('./config/publicutils/analysisManager.utils'));
const LocationManager = require(path.resolve('./config/publicutils/locationManager.utils'));

const getAnalysisFromGFWList = async (req, listId, locationId) => {
  const listAnalyses = [];
  const locationAttributeArray = [];
  const locationAnalysisArray = [];
  const list_id = listId;
  const location_ids = locationId;

  try {
    const noGeomData = await GFWListManager.getGFWListLocationsNoGeom(req, list_id, location_ids);
    const gfwListAnalysesData = await AnalysisManager.getAnalysisDataForGFWList(
      req,
      list_id,
      location_ids
    );
    const gfwLocationsAnalysesData = await AnalysisManager.getGFWListAnalyses(req, list_id);
    locationAttributeArray.push(...noGeomData);
    locationAnalysisArray.push(...gfwListAnalysesData);
    listAnalyses.push(...gfwLocationsAnalysesData);

    const locationAttributeList = await LocationManager.getLocationAttributesList(
      req,
      locationAttributeArray,
      true
    );
    return {
      list_analysis: listAnalyses,
      location_analyses: [locationAttributeList, locationAnalysisArray],
    };
  } catch (err) {
    console.log('Error /locations/getGFWListLocationData', err);
    return false;
  }
};

module.exports = {
  getAnalysisFromGFWList,
};
