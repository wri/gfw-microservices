const path = require('path');
const GFWListManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
const AnalysisManager = require(path.resolve('./config/publicutils/analysisManager.utils'));
const LocationManager = require(path.resolve('./config/publicutils/locationManager.utils'));

module.exports = async function (req) {
  const listId = Number(req.params.listId);
  const locationId = Number(req.body.locationId);
  let listLocationsIds = locationId ? [locationId] : [];

  let listAnalysis = [];
  let locationAttributeArray = [];
  let locationAnalysisArray = [];

  try {
    const noGeomListLocationData = await GFWListManager.getGFWListLocationsNoGeom(
      req,
      listId,
      listLocationsIds
    );
    const gfwListAnalysesData = await AnalysisManager.getAnalysisDataForGFWList(
      req,
      listId,
      listLocationsIds
    );
    const gfwLocationsAnalysesData = await AnalysisManager.getGFWListAnalyses(req, listId);

    locationAttributeArray.push(...noGeomListLocationData);
    locationAnalysisArray.push(...gfwListAnalysesData);
    listAnalysis.push(...gfwLocationsAnalysesData);

    const locationAttributeList = await LocationManager.getLocationAttributesList(
      req,
      locationAttributeArray,
      true
    );

    let spatialData;

    if (locationId) {
      const locationsData = await GFWListManager.getGFWListLocationsGeom(
        req,
        listId,
        listLocationsIds
      );
      spatialData = locationsData?.features || [];
    } else {
      const listLocations = await GFWListManager.getGFWListLocationsNoGeom(
        req,
        listId,
        listLocationsIds
      );
      listLocationsIds = listLocations.map((location) => {
        return location.location_id;
      });
      spatialData = [];
    }

    return {
      spatialData,
      listLocationsIds,
      listAnalysis,
      locationAnalyses: [locationAttributeList, locationAnalysisArray],
    };
  } catch (error) {
    console.warn('Error /getAnalysisFromGFWList', error);
    return false;
  }
};
