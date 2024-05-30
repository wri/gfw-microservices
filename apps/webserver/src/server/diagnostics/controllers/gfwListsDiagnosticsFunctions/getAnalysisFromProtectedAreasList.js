import { getAnalysisDataForProtectedAreasByLocationId } from '../../../../config/publicutils/analysisManager.utils';
import {
  getGFWListLocationsGeom,
  getGFWListLocationsNoGeom,
} from '../../../../config/publicutils/gfwListManager.utils';
import { gfwListsIds } from '@wri-monorepos/constants';

export const getAnalysisFromProtectedAreasList = async (req) => {
  const { locationId } = req.body;
  const { PROTECTED_AREAS: listId } = gfwListsIds;
  let listLocationsIds = locationId ? [locationId] : [];

  try {
    const { listData, protectedLocationResult } =
      await getAnalysisDataForProtectedAreasByLocationId(req, listId, locationId);

    let spatialData;

    if (locationId) {
      const locationsData = await getGFWListLocationsGeom(req, listId, listLocationsIds);
      spatialData = locationsData?.features || [];
    } else {
      const listLocations = await getGFWListLocationsNoGeom(req, listId, listLocationsIds);
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
