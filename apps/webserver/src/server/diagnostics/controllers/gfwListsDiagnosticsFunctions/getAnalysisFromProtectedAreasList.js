const path = require('path');
const AnalysisManager = require(path.resolve('./config/publicutils/analysisManager.utils'));
const GFWListManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
import { gfwListsIds } from '@wri-monorepos/constants';

module.exports = async function (req) {
  const { locationId } = req.body;
  const { PROTECTED_AREAS: listId } = gfwListsIds;
  let listLocationsIds = locationId ? [locationId] : [];

  try {
    const { listData, protectedLocationResult } =
      await AnalysisManager.getAnalysisDataForProtectedAreasByLocationId(req, listId, locationId);

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
      listAnalysis: [],
      locationAnalyses: [listData, protectedLocationResult],
    };
  } catch (error) {
    console.warn('Error /getAnalysisFromProtectedAreasList', error);
    return error;
  }
};
