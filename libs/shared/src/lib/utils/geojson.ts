import { parse as wellknown, stringify } from 'wellknown';
import { objectHasOwnProperty } from './object';

/** @function {GetWKTGeometry}
 * NOT USED - This function
 *   @summary Converts a Geojson to a MSSQL Geometry type
 *   @param {Object} geojson - the geojson feature collection
 *   @return {String} returns array geometry strings
 */
export const GetWKTGeometry = (geojsonGeometry) => {
  return stringify(geojsonGeometry);
};

/** @function {getGeoJSONGeometry}
 *   @summary Converts a WKT Geometry to GeoJSON geometry
 *   @param {String} wktGeometry - WKT Geometry to transform
 *   @return {Object} returns GeoJSON geometry
 */
export const getGeoJSONGeometry = (wktGeometry) => {
  return wellknown(wktGeometry);
};

/** @function {createGeoJSON}
 *   @summary Create a GeoJSON from array objects from SQL server
 *   @param {Array} recordsets - recordsets from stored procedure uspGetListLocations
 *   @return {Object} returns GeoJSON
 */
export const createGeoJSON = (recordsets) => {
  const geojson = {
    type: 'FeatureCollection',
    features: [],
  };

  recordsets.forEach((location) => {
    const feature = {
      type: 'Feature',
      properties: {},
      geometry: {},
    };
    for (const property in location) {
      if (objectHasOwnProperty(location, property)) {
        if (property !== 'Geometry') {
          if (property === 'WKTGeometry') {
            feature.geometry = getGeoJSONGeometry(location[property]);
          } else {
            feature.properties[property] = location[property];
          }
        }
      }
    }
    geojson.features.push(feature);
  });

  return geojson;
};

/**
 * Returns a GeoJSON containing dashboard analysis data. Geometry is removed for the dissolved geojson.
 * @param {Object} geojson GeoJSON object containing the geometries
 * @param {Array} gladData Glad data
 * @param {Array} fireData Fires data
 * @param {Array} extentData Extent data
 * @param {Array} gladValidateData Validated glad data
 * @param {Boolean} withGeom Boolean indicating the need for the geometry property
 */
export const mergeGeoJSONWithAnalysis = (
  geojson,
  gladData,
  fireData,
  extentData,
  gladValidateData
) => {
  return new Promise((resolve) =>
    resolve({
      type: 'FeatureCollection',
      features: geojson.features.map((f, i) => {
        const { gadmid } = f.properties;
        const analysisObject = {
          glad: gladData[i],
          fire: fireData[i],
          umd: extentData[i],
          gladAlerts: gladValidateData[i],
          fireAlerts: true,
          error: false,
        };
        f.properties = Object.assign(f.properties, analysisObject);
        if (gadmid) {
          f.properties.gadmid_0 = gadmid.substring(0, 3).padEnd(9, '0');
          f.properties.gadmid_1 = gadmid.substring(0, 5).padEnd(9, '0');
          f.properties.gadmid_2 = gadmid;
        }
        if (
          !objectHasOwnProperty(f.properties, 'Country') &&
          objectHasOwnProperty(f.properties, 'name_0')
        ) {
          f.properties['Country'] = f.properties.name_0;
        }
        if (
          !objectHasOwnProperty(f.properties, 'State') &&
          objectHasOwnProperty(f.properties, 'name_1')
        ) {
          f.properties['State'] = f.properties.name_1;
        }
        if (
          !objectHasOwnProperty(f.properties, 'Sub State') &&
          objectHasOwnProperty(f.properties, 'name_2')
        ) {
          f.properties['Sub State'] = f.properties.name_2;
        }

        return f;
      }),
    })
  );
};
