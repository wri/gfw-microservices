import * as asyncPool from 'tiny-async-pool';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { AbstractHandler, ChainType } from './types';
import { Logger } from '@nestjs/common';
import { executeQueryJSON } from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import { arcgisToGeoJSON, GeoJSONGeometry, geojsonToArcGIS } from './arcgis-to-geojson';

const PRODUCTION_ENVIRONMENTS = ['production', 'ProdV2'];
const POOL_SIZE = 5;
export class GADMService extends AbstractHandler<ChainType> {
  logger = new Logger(GADMService.name);

  getGadmServiceUrl = () => {
    return PRODUCTION_ENVIRONMENTS.includes(process.env.NODE_ENV)
      ? process.env.GADM_SERVICE__PROD
      : process.env.GADM_SERVICE__STAGING;
  };

  esriQuery = (url = '', queryProperties = {}) => {
    const query = new Query(queryProperties);
    return executeQueryJSON(url, query);
  };

  getGeoReferenceData = async (feature: Feature) => {
    const serviceURL = this.getGadmServiceUrl();
    const queryProperties = {
      geometry: feature.geometry,
      returnGeometry: false,
      outFields: ['gadmid', 'name_0', 'name_1', 'name_2'],
    };
    const response = await this.esriQuery(serviceURL, queryProperties);
    if (response.features && response.features.length > 0) {
      feature.properties = {
        ...feature.properties,
        substate: response.features[0].attributes.name_2,
        state: response.features[0].attributes.name_1,
        country: response.features[0].attributes.name_0,
        gadmid: response.features[0].attributes.gadmid,
      };
    }
  };

  batchGeoms = (geojson: FeatureCollection) => {
    geojson.features.sort(
      (a, b) => (a.properties.longitude as number) - (b.properties.longitude as number)
    );

    const geojsonBatches = [];
    const longitudeRanges = [];
    for (let l = -180; l < 180; l += 10) {
      longitudeRanges.push({
        min: l,
        max: l + 9.9999999,
        geo: {
          type: 'FeatureCollection',
          features: [],
        },
      });
    }

    geojson.features.forEach((feat) => {
      longitudeRanges.forEach((range) => {
        if (feat.properties.Longitude >= range.min && feat.properties.Longitude < range.max) {
          range.geo.features.push(feat);
        }
      });
    });

    longitudeRanges.forEach((range) => {
      if (range.geo.features.length > 0) {
        geojsonBatches.push(range.geo);
      }
    });

    return geojsonBatches;
  };

  assembleGeojson = (featProps, geometries) => {
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };
    const geomsToConvert = [];

    try {
      geometries.forEach((geom, i) => {
        if (!geom) {
          const geometry = new Point({
            latitude: featProps[i].Latitude,
            longitude: featProps[i].Longitude,
          });
          let value;
          if (parseFloat(featProps[i]['Analysis Radius'])) {
            value = parseFloat(featProps[i]['Analysis Radius']);
          } else if (parseFloat(featProps[i]['Analysis Area'])) {
            value = Math.sqrt(parseFloat(featProps[i]['Analysis Area']) / 100 / Math.PI);
          }

          const wgsGeometry = geometryEngine.geodesicBuffer(
            geometry,
            value.toFixed(3),
            'kilometers'
          );

          // If the geometry's buffer is empty... (happens when a very small radius is given)
          if (!wgsGeometry) {
            throw new Error("If the geometry's buffer is empty");
          }
          geomsToConvert.push(wgsGeometry);
        } else {
          geomsToConvert.push(geom);
        }
      });
    } catch (error) {
      this.logger.error('Error in assembleGeojson', error);
    }

    geomsToConvert?.forEach((convertedGeom, j) => {
      const geojsonGeom = arcgisToGeoJSON(geomsToConvert[j]);
      const { coordinates } = geojsonGeom as GeoJSONGeometry;

      for (let i = 0; i < coordinates?.length || 0; i += 1) {
        const ring = coordinates[i];
        ring.forEach((vertex) => {
          if (geomsToConvert[j].type === 'Polygon') {
            if (vertex.length > 2) {
              const newVertex = [];
              newVertex.push(vertex[0]);
              newVertex.push(vertex[1]);

              vertex = newVertex;
            }
          } else if (geomsToConvert[j].type === 'MultiPolygon') {
            vertex.forEach((subVertex) => {
              // vertex here is actually a ring! subVertex represents a point!
              if (subVertex.length > 2) {
                const newVertex = [];
                newVertex.push(subVertex[0]);
                newVertex.push(subVertex[1]);

                subVertex = newVertex;
              }
            });
          }
        });
      }

      if (Object.keys(geojsonGeom).length > 0) {
        geojson.features.push({
          type: 'Feature',
          properties: featProps[j],
          geometry: geojsonGeom,
        });
      }
    });
    return geojson;
  };

  calculateClippedArea = (geojson) => {
    geojson.features.forEach((feature) => {
      const esriJson = geojsonToArcGIS(feature);
      const esriGeometry = new Polygon({
        rings: esriJson.geometry.rings,
        spatialReference: SpatialReference.WGS84,
      });

      const area = geometryEngine.geodesicArea(esriGeometry, 'hectares');
      feature.properties['Analysis Area'] = area;
    });
  };

  composeResults = async (feature: Feature) => {
    this.getGeoReferenceData(feature);
  };

  async handle(input: ChainType): Promise<void> {
    const { geojson } = input;
    const { listId } = input.request;
    const { features } = geojson as FeatureCollection;

    for await (const localPage of asyncPool(POOL_SIZE, features, this.composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }
  }
}
