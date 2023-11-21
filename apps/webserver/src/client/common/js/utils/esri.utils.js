import Graphic from '@arcgis/core/Graphic';

// Configs
import { centroidSymbol } from '../map.config';

/**
 * @description - Creates an ESRI Graphic representing a point centroid based on specified longitude and latitude coordinates. This graphic can include additional attributes for further details or styling.
 *
 * @param {number} Longitude - The geographical longitude coordinate of the centroid.
 * @param {number} Latitude - The geographical latitude coordinate of the centroid.
 * @param {Object} attributes - Optional. Additional properties or attributes to be assigned to the graphic, such as metadata or styling information.
 * @return {Graphic} - An ESRI Graphic object representing a point at the specified coordinates, with any provided attributes.
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
