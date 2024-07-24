import { parse, load } from '@loaders.gl/core';
import { ZipLoader } from '@loaders.gl/zip';
import { KMLLoader } from '@loaders.gl/kml';
import Polygon from '@arcgis/core/geometry/Polygon';
import geojsonUtil from '../../../../common/js/utils/arcgis-to-geojson';
import { geomFromLatLongRadiusArea } from './geomFromPoint';

/**
 * Parses KMZ and KML Files for upload functionality
 * This code duplicates some logic as the parseKML() function in StepThree.jsx,
 * but this is temporary until we move all upload functionality to the backend
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
      const analysisAreaKey = feature.properties.Analysis_A ? 'Analysis_A' : 'Analysis Area';
      const analysisRadiusKey = feature.properties.Analysis_R ? 'Analysis_R' : 'Analysis Radius';
      geom = geomFromLatLongRadiusArea(
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0],
        feature.properties[analysisRadiusKey],
        feature.properties[analysisAreaKey]
      );
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
