import { getAnalysisDataForGFWList } from '../../../../config/publicutils/analysisManager.utils';
import {
  getAdministrativeAreasDataByLocationId,
  getGFWListLocationsGeom,
  getGFWListLocationsNoGeom,
} from '../../../../config/publicutils/gfwListManager.utils';
import { gfwListsIds } from '@wri-monorepos/constants';

export default async function (req) {
  const locationId = Number(req.body.locationId);
  const { ADMINISTRATIVE_AREAS: listId } = gfwListsIds;
  let listLocationsIds = locationId ? [locationId] : [];

  try {
    const listData = await getAdministrativeAreasDataByLocationId(req, locationId);

    const protectedLocationResult = await getAnalysisDataForGFWList(req, listId, listLocationsIds);

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
    console.warn('Error /getAnalysisFromAdministrativeAreasList', error);
    return error;
  }
}
