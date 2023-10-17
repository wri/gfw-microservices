import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import geojsonUtil from '../../../../common/js/utils/arcgis-to-geojson';

/**
 * Parses KMZ and KML Files for upload functionality
 * @param {object} file Upload File data
 * @returns Promise<{object}> ESRI Polygon
 */
export const parseKMZAndKMLFile = (file) => {
  return new Promise((resolve, reject) => {
    let geom = null;
    // Ogre web service - uses ogr2ogr CLI
    const url = 'https://ogre.adc4gis.com/convert';
    const form = new FormData();
    form.append('upload', file);
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', url);
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        const geojson = JSON.parse(xmlhttp.response);
        const feature = geojson.features[0];
        //Ogre service does return coordinates that contain 3 values when pushing a kml file,
        //this is likely due to the bug, we sanitize the response to where we only use the first two values for coordinates
        const filteredFeatures = feature.geometry.coordinates[0].map((c) => {
          return c.slice(0, 2);
        });
        feature.geometry.coordinates = [filteredFeatures];
        if (feature.geometry.type === 'Point') {
          geom = new Point({
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
          });
        } else if (
          feature.geometry.type === 'Polygon' ||
          feature.geometry.type === 'MultiPolygon'
        ) {
          feature.geometry.coordinates[0].forEach((coord, j) => {
            feature.geometry.coordinates[0][j] = [coord[0], coord[1]];
          });

          const esriJson = geojsonUtil.geojsonToArcGIS(feature.geometry);
          geom = new Polygon({
            rings: esriJson.rings,
            spatialReference: { wkid: 4326 },
          });
        }
        resolve(geom);
      } else if (xmlhttp.status > 400) {
        reject(new Error('Failed to parse'));
      }
    };
    xmlhttp.send(form);
  });
};
