import axios from 'axios';
import geojsonUtil from '../../../../common/js/utils/arcgis-to-geojson';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as GeometryEngine from '@arcgis/core/geometry/geometryEngine';
import * as projection from '@arcgis/core/geometry/projection.js';
import { discernProjection } from '../../utils/upload.utils';
import { locationsPage, convertURL } from '../../../../common/js/config';

export const parseZip = (file, stateOriginalGeometry) => {
  return discernProjection(file)
    .then((projDefs) => {
      if (!projDefs[0]) {
        const formData = new FormData();
        formData.append('file', file);

        return axios
          .post(convertURL, formData)
          .then((response) => {
            const data = response.data;
            let geom;
            const oldSpatialRef = new SpatialReference({ wkid: projDefs[1] });
            const newSpatialRef = SpatialReference.WGS84;
            projection.load().then(() => {
              if (data?.attributes?.features?.length > 0) {
                const feat = data.attributes.features[0];
                if (feat.geometry?.coordinates?.[0] instanceof Array) {
                  const esriJson = geojsonUtil.geojsonToArcGIS(feat.geometry);
                  const oldFeatGeometry = new Polygon({
                    rings: esriJson.rings,
                    spatialReference:
                      esriJson.spatialReference.wkid === newSpatialRef.wkid
                        ? esriJson.spatialReference
                        : oldSpatialRef,
                  });
                  geom = projection.project(oldFeatGeometry, newSpatialRef);
                } else if (typeof feat.geometry?.coordinates?.[0] === 'number') {
                  const centerPoint = {
                    type: 'point',
                    x: feat.geometry.coordinates[0],
                    y: feat.geometry.coordinates[1],
                    spatialReference: oldSpatialRef,
                  };
                  const projectedCenterPoint = projection.project(centerPoint, newSpatialRef);
                  // buffer the point into a poly based off of Analysis_R/Analysis_A and setGeometry of that poly!
                  if (feat.properties.Analysis_R) {
                    geom = GeometryEngine.geodesicBuffer(
                      projectedCenterPoint,
                      parseFloat(feat.properties.Analysis_R),
                      'kilometers'
                    );
                  } else if (feat.properties.Analysis_A) {
                    const kilosSquared = feat.properties.Analysis_A / 100;
                    const kilos = Math.sqrt(kilosSquared / Math.PI);
                    geom = GeometryEngine.geodesicBuffer(
                      stateOriginalGeometry,
                      kilos.toFixed(2),
                      'kilometers'
                    );
                  } else {
                    geom = GeometryEngine.geodesicBuffer(projectedCenterPoint, 4, 'kilometers'); // Medium Buffer
                  }

                  return { geom, isUploading: false };
                }
              }
            });
          })
          .catch((error) => {
            console.log('Error: shapefile not working', error);
          });
      } else {
        return {
          isUploading: false,
          dialogOpen: true,
          dialogTitle: locationsPage.upload.errors.dataProjection,
          dialogMessage: projDefs[0],
        };
      }
    })
    .catch((ex) => {
      return {
        dialogOpen: true,
        dialogTitle: locationsPage.upload.errors.dataRead,
        dialogMessage: ex,
        isUploading: false,
      };
    });
};
