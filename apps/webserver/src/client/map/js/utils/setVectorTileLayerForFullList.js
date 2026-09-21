import { generateCentroidGraphic } from '../../../common/js/utils/esri.utils';
import { USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID } from '../config/map.config';
import { handleUserListLocationsVectorTileLayer } from '../../../common/js/userListLocations/utils/userListLocations.util';

const setVectorTileLayerForFullList = async (listData, transitionListData, view) => {
  const listID = listData[0].features[0].properties.list_id;

  const mapCenter = await handleUserListLocationsVectorTileLayer(view, listID);

  const userLayer = view.map.findLayerById(USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID);
  userLayer?.removeAll();

  const locationData = [];
  const centroidGraphics = [];

  listData.forEach((list) => {
    locationData.push(...list.features);
  });

  locationData.forEach((location) => {
    const { properties } = location;
    const { Latitude, Longitude } = properties;

    if (Latitude && Longitude) {
      const listLocationCentroidGraphic = generateCentroidGraphic(Longitude, Latitude, properties);

      centroidGraphics.push(listLocationCentroidGraphic);
    }
  });

  userLayer?.addMany([...centroidGraphics]);

  const alertsMapExtent = transitionListData?.alertsMapExtent;
  return alertsMapExtent || mapCenter;
};

export default setVectorTileLayerForFullList;
