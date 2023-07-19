import Graphic from 'esri/Graphic';
import Polygon from 'esri/geometry/Polygon';
import geojsonUtil from '../../../common/js/utils/arcgis-to-geojson';
import { generateCentroidGraphic } from './esri.utils';
import { USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID } from '../config/map.config';
import { centroidSymbol } from '../../../common/js/map.config';

const setGeometriesForSelectedLocationsInTheMap = (listData, view, transitionListData) => {
  const userLayer = view.map.findLayerById(USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID);
  userLayer.removeAll();

  const locationData = [];
  const pointGraphic = [];
  const polygonGraphic = [];
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

    const markerSymbol = {
      type: 'simple-marker',
      color: [226, 119, 40],
      outline: {
        color: [255, 255, 255],
        width: 2,
      },
    };
    const fillSymbol = {
      type: 'simple-fill',
      color: [227, 139, 79, 0], // [227, 139, 79, 0.8],
      outline: {
        color: [139, 174, 59, 1], // [255, 255, 255],
        width: 1,
      },
    };

    const popupTemplate = {
      title: '<div class="location-popup-title">{Location Name}{Investment Name}</div>',
    };

    if (location.geometry.type === 'Point') {
      const point = {
        type: 'point',
        longitude: location.geometry.coordinates[0],
        latitude: location.geometry.coordinates[1],
      };

      pointGraphic.push(
        new Graphic({
          geometry: point,
          symbol: markerSymbol,
          attributes: location.properties,
          popupTemplate,
        })
      );
    } else if (location.geometry.type === 'Polygon' || location.geometry.type === 'MultiPolygon') {
      const polygon = geojsonUtil.geojsonToArcGIS(location.geometry);
      polygonGraphic.push(
        new Graphic({
          geometry: new Polygon(polygon),
          symbol: fillSymbol,
          attributes: location.properties,
          popupTemplate,
        })
      );
      centroidGraphics.push(
        new Graphic({
          geometry: new Polygon(polygon),
          symbol: centroidSymbol,
          attributes: location.properties,
        })
      );
    }
  });

  userLayer.addMany([...pointGraphic, ...polygonGraphic, ...centroidGraphics]);

  const dashboard_map_extent = transitionListData?.dashboard_map_extent
    ? transitionListData.dashboard_map_extent
    : null;

  if (dashboard_map_extent) {
    view.extent = dashboard_map_extent;
  } else {
    view.goTo(
      {
        target: [...pointGraphic, ...polygonGraphic],
      },
      { duration: 1000 }
    );
  }
};

export default setGeometriesForSelectedLocationsInTheMap;
