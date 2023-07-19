/*********************************************************************************************************
 * ESM Migration Info
 * This file can be removed once src/client/locations is updated to use arcgis ES Modules.
 * It is a copy of src/client/common/js/utils/esri.utils.js
 *
 * Currently, the map view is the focus of the migration effort. Therefore, to keep changes isolated to
 * just the Map functionality, common code has been copied down into src/client/map when necessary.
 * There is a ticket to do this so we don't forget: https://gfw.atlassian.net/browse/GPV-2000
 *********************************************************************************************************/
import Graphic from '@arcgis/core/Graphic';

// Configs
import { centroidSymbol } from '../../../common/js/map.config';

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
