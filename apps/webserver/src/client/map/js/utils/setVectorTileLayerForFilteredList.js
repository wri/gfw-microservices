import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Extent from '@arcgis/core/geometry/Extent';
import Polygon from '@arcgis/core/geometry/Polygon';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Graphic from '@arcgis/core/Graphic';
import { generateCentroidGraphic } from '../../../common/js/utils/esri.utils';
import { USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID } from '../config/map.config';
import { handleUserListLocationsVectorTileLayer } from '../../../common/js/userListLocations/utils/userListLocations.util';

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

  const selectedLocationCoordinates = locationData[0]?.geometry?.coordinates;

  if (selectedLocationCoordinates) {
    const geometry = new Polygon({
      rings: selectedLocationCoordinates,
      spatialReference: SpatialReference.WGS84,
    });

    const symbol = new SimpleFillSymbol({
      color: [151, 189, 61, 0.65],
      outline: {
        color: [151, 189, 61, 1],
        width: 1,
      },
    });

    const graphic = new Graphic({
      geometry,
      symbol,
    });
    view.goTo(graphic);
  } else if (dashboard_map_extent) {
    const extent = new Extent(dashboard_map_extent);
    view.goTo(extent);
  }
};

export default setVectorTileLayerForFilteredList;
