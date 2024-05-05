const path = require('path');
const AnalysisManager = require(path.resolve('./config/publicutils/analysisManager.utils'));
const GFWListManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
import { gfwListsIds } from '@wri-monorepos/constants';

export default async function (req) {
  const locationId = Number(req.body.locationId);
  const { ADMINISTRATIVE_AREAS: listId } = gfwListsIds;
  let listLocationsIds = locationId ? [locationId] : [];

  try {
    const listData = await GFWListManager.getAdministrativeAreasDataByLocationId(req, locationId);

    const protectedLocationResult = await AnalysisManager.getAnalysisDataForGFWList(
      req,
      listId,
      listLocationsIds
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
      listAnalysis: [],
      locationAnalyses: [listData, protectedLocationResult],
    };
  } catch (error) {
    console.warn('Error /getAnalysisFromAdministrativeAreasList', error);
    return error;
  }
}
