import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import { NEW_LOCATION_AREA_OPTIONS } from '../areaOptions.constants';

const WGS_1984_SPATIAL_REFERENCE = 4326;

// Constants for radius values in meters
const SMALL_RADIUS_METERS = 1780; // 1.78 km
const MEDIUM_RADIUS_METERS = 3990; // 3.99 km
const LARGE_RADIUS_METERS = 7980; // 7.98 km
const HECTARE_TO_METERS = 10000;
const KILOMETER_TO_METERS = 1000;

export const getPointGeometry = (coordinates, selectedRadius, areaUnit, customRadiusSize) => {
  const { latitude, longitude } = coordinates[0];

  const { SMALL, MEDIUM, LARGE, CUSTOM } = NEW_LOCATION_AREA_OPTIONS;
  let radius;
  switch (selectedRadius) {
    case SMALL.id:
      radius = SMALL_RADIUS_METERS;
      break;
    case MEDIUM.id:
      radius = MEDIUM_RADIUS_METERS;
      break;
    case LARGE.id:
      radius = LARGE_RADIUS_METERS;
      break;
    case CUSTOM.id:
      if (areaUnit === 'kilometers') {
        radius = customRadiusSize * KILOMETER_TO_METERS;
      } else {
        // area in hectares converted to radius in meters
        radius = Math.sqrt((customRadiusSize * HECTARE_TO_METERS) / Math.PI);
      }
      break;
    default:
      break;
  }

  const pointGeometry = new Point({
    longitude,
    latitude,
    spatialReference: {
      wkid: WGS_1984_SPATIAL_REFERENCE,
    },
  });

  const bufferGeometry = geometryEngine.geodesicBuffer(pointGeometry, radius, 'meters');

  return bufferGeometry;
};

export const getPolygonGeometry = (coordinates) => {
  const polygonCoordinates = coordinates.map((coord) => [coord.longitude, coord.latitude]);

  const polygon = new Polygon({
    rings: polygonCoordinates,
    spatialReference: {
      wkid: WGS_1984_SPATIAL_REFERENCE,
    },
  });

  return polygon;
};
