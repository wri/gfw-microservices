import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Point from '@arcgis/core/geometry/Point';

const WGS_1984_SPATIAL_REFERENCE = 4326;

// Constants for radius values in meters
const SMALL_RADIUS_METERS = 1780; // 1.78 km
const MEDIUM_RADIUS_METERS = 3990; // 3.99 km
const BIG_RADIUS_METERS = 7980; // 7.98 km
const KM_TO_METERS = 10000;

export const getPointGeometry = (coordinates, selectedRadius, areaUnit, customRadiusSize) => {
  const { latitude, longitude } = coordinates[0];

  let radius;

  switch (selectedRadius) {
    case 'small':
      radius = SMALL_RADIUS_METERS;
      break;
    case 'medium':
      radius = MEDIUM_RADIUS_METERS;
      break;
    case 'big':
      radius = BIG_RADIUS_METERS;
      break;
    case 'custom':
      if (areaUnit === 'km') {
        radius = customRadiusSize;
      } else {
        // area in hectares converted to radius in meters
        radius = Math.sqrt((customRadiusSize * KM_TO_METERS) / Math.PI);
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

  const polygon = {
    type: 'polygon',
    rings: polygonCoordinates,
  };

  return polygon;
};
