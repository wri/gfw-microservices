import { parse, load } from '@loaders.gl/core';
import { ZipLoader } from '@loaders.gl/zip';
import { KMLLoader } from '@loaders.gl/kml';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import geojsonUtil from '../../../../common/js/utils/arcgis-to-geojson';

/**
 * Parses KMZ and KML Files for upload functionality
 * @param {object} file Upload File data
 * @returns {Promise<object>} ESRI Polygon
 */
export const parseKMZAndKMLFile = async (file) => {
  try {
    let kmlFile = file;
    if (file.name.includes('.kmz')) {
      kmlFile = await parse(file, ZipLoader);
      kmlFile = kmlFile['doc.kml'];
    }

    const data = await load(kmlFile, KMLLoader);
    const feature = data?.features[0];
    // Filter out Z values
    if (Array.isArray(feature?.geometry?.coordinates[0])) {
      const filteredFeatures = feature.geometry.coordinates[0].map((c) => c.slice(0, 2));
      feature.geometry.coordinates = [filteredFeatures];
    }
    let geom = null;
    if (feature.geometry.type === 'Point') {
      geom = new Point({
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      });
    } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates[0].forEach((coord, j) => {
        feature.geometry.coordinates[0][j] = [coord[0], coord[1]];
      });

      const esriJson = geojsonUtil.geojsonToArcGIS(feature.geometry);
      geom = new Polygon({
        rings: esriJson.rings,
        spatialReference: { wkid: 4326 },
      });
    }

    return geom;
  } catch (error) {
    throw new Error('Failed to parse');
  }
};
