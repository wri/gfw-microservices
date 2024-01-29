import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Point from '@arcgis/core/geometry/Point';

export const getPointGeometry = (coordinates, selectedRadius, areaUnit, customRadiusSize) => {
  const { latitude, longitude } = coordinates[0];

  let radius;

  switch (selectedRadius) {
    case 'small':
      radius = 1780; // 1.78 km
      break;
    case 'medium':
      radius = 3990; // 3.99 km
      break;
    case 'big':
      radius = 7980; // 7.98 km
      break;
    case 'custom':
      if (areaUnit === 'km') {
        radius = customRadiusSize;
      } else {
        radius = Math.sqrt((customRadiusSize * 10000) / Math.PI);
      }
      break;
    default:
      break;
  }

  const pointGeometry = new Point({
    longitude,
    latitude,
    spatialReference: {
      wkid: 4326,
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
