/** ******************************************************************
 *   @name : location.utils.js
 *   @description : A utility file for locations
 *
 *   @function {getWKTGeometry}
 *   @function {getGeoJSONGeometry}
 *   @function {createGeoJSON}
 *
 ********************************************************************/
// Imports required for this module
const fs = require('fs');
const path = require('path');
const wellknown = require('wellknown');

/** @function {getWKTGeometry}
 *   @summary Converts a Geojson to a MSSQL Geometry type
 *   @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Object} geojsonGeometry - the geojson feature collection
 *   @return {String} returns array geometry strings
 */
const getWKTGeometry = (req, geojsonGeometry) => {
  return wellknown.stringify(geojsonGeometry);
};

/** @function {getGeoJSONGeometry}
 *   @summary Converts a WKT Geometry to GeoJSON geometry
 *   @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {String} wktGeometry - WKT Geometry to transform
 *   @return {Object} returns GeoJSON geometry
 */
const getGeoJSONGeometry = (req, wktGeometry) => {
  return wellknown.parse(wktGeometry);
};

/** @function {createGeoJSON}
 *   @summary Create a GeoJSON from array objects from SQL server
 *   @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Array} recordsets - recordsets from stored procedure uspGetListLocations
 *   @return {Object} returns GeoJSON
 */
const createGeoJSON = (req, recordsets) => {
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
      if (location.hasOwnProperty(property)) {
        if (property !== 'Geometry') {
          if (property === 'WKTGeometry') {
            feature.geometry = getGeoJSONGeometry(req, location[property]);
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

const logGeoJSON = (geojson) => {
  if (process.env.NODE_ENV === 'development') {
    fs.writeFile(path.resolve('./config/geojosn.json'), JSON.stringify(geojson), (err) => {
      if (err) {
        console.log('Could not write file geojson');
      }
      console.log('Wrote Geojson');
    });
  }
};

/**
 * Returns a GeoJSON containing dashboard analysis data. Geometry is removed for the dissolved geojson.
 * @param {Object} geojson GeoJSON object containing the geometries
 * @param {Array} gladData Glad data
 * @param {Array} fireData Fires data
 * @param {Array} extentData Extent data
 * @param {Array} gladValidateData Validated glad data
 */
const mergeGeoJSONWithAnalysis = (geojson, gladData, fireData, extentData, gladValidateData) => {
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
        if (!f.properties.hasOwnProperty('Country') && f.properties.hasOwnProperty('name_0')) {
          f.properties['Country'] = f.properties.name_0;
        }
        if (!f.properties.hasOwnProperty('State') && f.properties.hasOwnProperty('name_1')) {
          f.properties['State'] = f.properties.name_1;
        }
        if (!f.properties.hasOwnProperty('Sub State') && f.properties.hasOwnProperty('name_2')) {
          f.properties['Sub State'] = f.properties.name_2;
        }

        return f;
      }),
    })
  );
};

module.exports = {
  getWKTGeometry,
  getGeoJSONGeometry,
  createGeoJSON,
  logGeoJSON,
};
