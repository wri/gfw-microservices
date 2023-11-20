import Extent from '@arcgis/core/geometry/Extent';
import { handleUserListLocationsVectorTileLayer } from '../userListLocations/utils/listLayer.util';
import { generateCentroidGraphic } from './esri.utils';
import { USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID } from '../config/map.config';

const setVectorTileLayerForFilteredList = async (listData, transitionListData, view) => {
  const listID = listData[0].features[0].properties.list_id;
  const locationIDs = listData[0].features.map((feature) => feature.properties.location_id);
  await handleUserListLocationsVectorTileLayer(view, listID, 'map', locationIDs);

  const userLayer = view.map.findLayerById(USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID);
  userLayer.removeAll();

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

  userLayer.addMany([...centroidGraphics]);

  const dashboard_map_extent = transitionListData?.dashboard_map_extent
    ? transitionListData.dashboard_map_extent
    : null;

  if (dashboard_map_extent) {
    const extent = new Extent(dashboard_map_extent);
    view.goTo(extent);
  }
};

export default setVectorTileLayerForFilteredList;
