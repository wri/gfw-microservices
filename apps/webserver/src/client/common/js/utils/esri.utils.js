import Graphic from 'esri/Graphic';

// Configs
import { centroidSymbol } from '../map.config';

/**
 * @description - Create centroid graphic
 *
 * @param {number} Longitude - Longitude
 * @param {number} Latitude - Latitude
 * @param {Object} attributes - GeoJSON properties
 * @return {Object} - ESRI Graphic
 */
export function generateCentroidGraphic(Longitude, Latitude, attributes = {}) {
  const centroidPoint = {
    type: 'point',
    longitude: Longitude,
    latitude: Latitude,
  };

  const listLocationCentroidGraphic = new Graphic({
    geometry: centroidPoint,
    symbol: centroidSymbol,
    attributes,
  });

  return listLocationCentroidGraphic;
}
