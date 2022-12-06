import { Injectable } from '@nestjs/common';
import { objectHasOwnProperty } from '@wri-monorepos/shared';
import { parse as wellknown, stringify } from 'wellknown';

@Injectable()
export class GeoService {
  /** @function {getWKTGeometry}
   * NOT USED - This function
   *   @summary Converts a Geojson to a MSSQL Geometry type
   *   @param {Object} geojson - the geojson feature collection
   *   @return {String} returns array geometry strings
   */
  getWKTGeometry = (geojsonGeometry) => {
    return stringify(geojsonGeometry);
  };

  /** @function {getGeoJSONGeometry}
   *   @summary Converts a WKT Geometry to GeoJSON geometry
   *   @param {String} wktGeometry - WKT Geometry to transform
   *   @return {Object} returns GeoJSON geometry
   */
  getGeoJSONGeometry = (wktGeometry) => {
    return wellknown(wktGeometry);
  };

  /** @function {createGeoJSON}
   *   @summary Create a GeoJSON from array objects from SQL server
   *   @param {Array} recordsets - recordsets from stored procedure uspGetListLocations
   *   @return {Object} returns GeoJSON
   */
  createGeoJSON = (recordsets) => {
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
        //if (location.hasOwnProperty(property)) {
        if (objectHasOwnProperty(location, property)) {
          if (property !== 'Geometry') {
            if (property === 'WKTGeometry') {
              feature.geometry = this.getGeoJSONGeometry(location[property]);
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

  // NOT USED - This function
  filterGeojsonByGADM = (geojson) => {
    const withGADM = {
      type: 'FeatureCollection',
      features: [],
    };
    const withoutGADM = {
      type: 'FeatureCollection',
      features: [],
    };
    for (let i = 0; i < geojson.features.length; i++) {
      const feature = geojson.features[i];
      const { properties } = feature;
      //if (!properties.hasOwnProperty('gadmid') || properties.gadmid === '' || properties.gadmid === 'None')
      if (
        !objectHasOwnProperty(properties, 'gadmid') ||
        properties.gadmid === '' ||
        properties.gadmid === 'None'
      ) {
        withoutGADM.features.push(feature);
      } else {
        withGADM.features.push(feature);
      }
    }
    return {
      withGADM,
      withoutGADM,
    };
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
  mergeGeoJSONWithAnalysis = (
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

  /**
   * NOT USED - This function
   * Prepares the data and GeoJSON to be merged together.
   * @param {Object} listGeoJSON List GeoJSON
   * @param {Object} dissolvedGeoJSON Location GeoJSON
   * @param {Array} listAnalyses List level analysis data
   * @param {Array} dissolvedAnalyses Location level analysis data
   */
  dashboardMerger = (
    listGeoJSON,
    dissolvedGeoJSON,
    listAnalyses,
    dissolvedAnalyses
  ) => {
    return new Promise((resolve) => {
      const [listGlad, listFire, listExtent, listValidate] = listAnalyses;
      const [dissolvedGlad, dissolvedFire, dissolvedExtent, dissolvedValidate] =
        dissolvedAnalyses;
      Promise.all([
        this.mergeGeoJSONWithAnalysis(
          listGeoJSON,
          listGlad,
          listFire,
          listExtent,
          listValidate
        ),
        this.mergeGeoJSONWithAnalysis(
          dissolvedGeoJSON,
          dissolvedGlad,
          dissolvedFire,
          dissolvedExtent,
          dissolvedValidate
        ),
      ]).then((mergedGeoJSONS) => {
        const [geojson, dissolvedGeojson] = mergedGeoJSONS;
        resolve({
          geojson,
          dissolvedGeoJSON: dissolvedGeojson,
        });
      });
    });
  };
}
