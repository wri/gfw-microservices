import { generateCentroidGraphic } from '../../../common/js/utils/esri.utils';
import { USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID } from '../config/map.config';
import { handleUserListLocationsVectorTileLayer } from '../../../common/js/userListLocations/utils/userListLocations.util';
import { getExtentFromLocationPoints } from '../../../common/js/userListLocations/utils/userListLocationsMap.util';

const setVectorTileLayerForFilteredList = async (listData, transitionListData, view) => {
  const listID = listData[0].features[0].properties.list_id;
  const locationIDs = listData[0].features.map((feature) => feature.properties.location_id);
  // Bounds-based fallback (whole list extent) in case the selected location(s) have no coordinates
  const listBoundsMapCenter = await handleUserListLocationsVectorTileLayer(
    view,
    listID,
    'map',
    locationIDs
  );

  const userLayer = view.map.findLayerById(USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID);
  userLayer?.removeAll();

  const locationData = [];
  const centroidGraphics = [];
  const points = [];

  listData.forEach((list) => {
    locationData.push(...list.features);
  });

  locationData.forEach((location) => {
    const { properties } = location;
    const { Latitude, Longitude } = properties;

    if (Latitude && Longitude) {
      const listLocationCentroidGraphic = generateCentroidGraphic(Longitude, Latitude, properties);

      centroidGraphics.push(listLocationCentroidGraphic);
      points.push({ latitude: Latitude, longitude: Longitude });
    }
  });
  userLayer?.addMany([...centroidGraphics]);

  const alertsMapExtent = transitionListData?.alertsMapExtent;
  const selectedLocationsExtent = getExtentFromLocationPoints(points);
  const mapCenter = selectedLocationsExtent
    ? { target: selectedLocationsExtent }
    : listBoundsMapCenter;

  return alertsMapExtent || mapCenter;
};

export default setVectorTileLayerForFilteredList;
