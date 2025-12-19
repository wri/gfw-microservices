import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import Point from '@arcgis/core/geometry/Point';
import Multipoint from '@arcgis/core/geometry/Multipoint';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import errorLogger from '../../../../common/js/utils/errorLogger';

export const createResultsGraphic = async (item) => {
  await new Promise((resolve) => setTimeout(resolve, 0)); // Allow UI updates

  const geojson = JSON.parse(item.gfw_geojson);
  const spatialReference = { wkid: 4326 };

  let geometry = null;

  const symbol = {
    type: 'simple-fill',
    color: [0, 120, 255, 0.5],
    outline: {
      color: [0, 120, 255, 1],
      width: 2,
    },
  };

  if (geojson.type === 'MultiPolygon') {
    const polygons = geojson.coordinates.map((polygonCoords) => {
      return new Polygon({
        rings: polygonCoords[0],
        spatialReference,
      });
    });

    geometry = geometryEngine.union(polygons);
  } else if (geojson.type === 'Point') {
    geometry = new Point({
      x: geojson.coordinates[0],
      y: geojson.coordinates[1],
      spatialReference,
    });
  } else if (geojson.type === 'MultiPoint') {
    geometry = new Multipoint({
      points: geojson.coordinates,
      spatialReference,
    });
  } else {
    errorLogger.error('Unsupported GeoJSON type in search results', {
      component: 'searchUtils',
      action: 'createResultsGraphic',
      geojsonType: geojson.type,
      item
    });
    return [];
  }

  const graphic = new Graphic({
    geometry,
    attributes: item,
    symbol,
  });

  return graphic;
};

export const getAdministrativeAreaName = (item) => {
  let title;

  switch (item.adm_level) {
    case '0':
      title = item.name_0 || 'Country';
      break;
    case '1':
      title = item.name_1 || 'State / Region';
      break;
    case '2':
      title = item.name_2 || 'Sub-region';
      break;
    default:
      title = item.name_1 || 'Area';
      break;
  }
  return title;
};

// REFERENCE: https://stackoverflow.com/a/5971628
export function dms2Deg(s) {
  // Determine if south latitude or west longitude
  var sw = /[sw]/i.test(s);

  // Determine sign based on sw (south or west is -ve)
  var f = sw ? -1 : 1;

  // Get into numeric parts
  var bits = s.match(/[\d.]+/g) || [];

  var result = 0;

  // Convert to decimal degrees
  for (var i = 0, iLen = bits.length; i < iLen; i++) {
    // String conversion to number is done by division
    // To be explicit (not necessary), use
    //   result += Number(bits[i])/f
    result += bits[i] / f;

    // Divide degrees by +/- 1, min by +/- 60, sec by +/-3600
    f *= 60;
  }

  return result;
}
