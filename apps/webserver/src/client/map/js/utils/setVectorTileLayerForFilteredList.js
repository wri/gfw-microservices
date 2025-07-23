import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Polygon from '@arcgis/core/geometry/Polygon';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Graphic from '@arcgis/core/Graphic';
import { generateCentroidGraphic } from '../../../common/js/utils/esri.utils';
import { USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID } from '../config/map.config';
import { handleUserListLocationsVectorTileLayer } from '../../../common/js/userListLocations/utils/userListLocations.util';

const POLYGON_FILL_COLOR = [151, 189, 61];
const POLYGON_OUTLINE_COLOR = [151, 189, 61];

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

  const fillGraphics = [];
  locationData.forEach((location) => {
    const { properties, geometry } = location;
    const { Latitude, Longitude } = properties;

    if (Latitude && Longitude) {
      const listLocationCentroidGraphic = generateCentroidGraphic(Longitude, Latitude, properties);

      centroidGraphics.push(listLocationCentroidGraphic);
    }

    if (geometry?.coordinates) {
      const polygon = new Polygon({
        rings: geometry.coordinates,
        spatialReference: SpatialReference.WGS84,
      });

      const symbol = new SimpleFillSymbol({
        color: [...POLYGON_FILL_COLOR, 0.4],
        outline: {
          color: [...POLYGON_OUTLINE_COLOR, 1],
          width: 1,
        },
      });

      const polygonGraphic = new Graphic({
        geometry: polygon,
        symbol,
        attributes: properties,
      });

      fillGraphics.push(polygonGraphic);
    }
  });
  userLayer.addMany([...centroidGraphics]);
  const alertsMapExtent = transitionListData?.alertsMapExtent;

  if (alertsMapExtent) {
    view.goTo(alertsMapExtent);
  } else if (locationData.length === 1) {
    return fillGraphics;
  } else if (locationData?.length > 1) {
    // Calculate the average latitude and longitude for centering
    const latitudes = locationData.map((location) => location.properties.Latitude);
    const longitudes = locationData.map((location) => location.properties.Longitude);

    const calculateAverage = (values) =>
      values.reduce((sum, value) => sum + value, 0) / values.length;

    const avgLatitude = calculateAverage(latitudes);
    const avgLongitude = calculateAverage(longitudes);

    return {
      center: [avgLongitude, avgLatitude],
      zoom: 3,
    };
  }
};

export default setVectorTileLayerForFilteredList;
