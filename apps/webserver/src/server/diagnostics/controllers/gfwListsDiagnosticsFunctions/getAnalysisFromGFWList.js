import {
  getGFWListLocationsNoGeom,
  getGFWListLocationsGeom,
} from '../../../../config/publicutils/gfwListManager.utils';
import {
  getAnalysisDataForGFWList,
  getGFWListAnalyses,
} from '../../../../config/publicutils/analysisManager.utils';
import { getLocationAttributesList } from '../../../../config/publicutils/locationManager.utils';

export const getAnalysisFromGFWList = async (req) => {
  const listId = Number(req.params.listId);
  const locationId = Number(req.body.locationId);
  let listLocationsIds = locationId ? [locationId] : [];

  let listAnalysis = [];
  let locationAttributeArray = [];
  let locationAnalysisArray = [];

  try {
    const noGeomListLocationData = await getGFWListLocationsNoGeom(req, listId, listLocationsIds);
    const gfwListAnalysesData = await getAnalysisDataForGFWList(req, listId, listLocationsIds);
    const gfwLocationsAnalysesData = await getGFWListAnalyses(req, listId);

    locationAttributeArray.push(...noGeomListLocationData);
    locationAnalysisArray.push(...gfwListAnalysesData);
    listAnalysis.push(...gfwLocationsAnalysesData);

    const locationAttributeList = await getLocationAttributesList(
      req,
      locationAttributeArray,
      true
    );

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
      listAnalysis,
      locationAnalyses: [locationAttributeList, locationAnalysisArray],
    };
  } catch (error) {
    console.warn('Error /getAnalysisFromGFWList', error);
    return false;
  }
};
