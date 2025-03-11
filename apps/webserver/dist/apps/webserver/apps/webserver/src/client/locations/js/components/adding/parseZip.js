import axios from 'axios';
import geojsonUtil from '../../../../common/js/utils/arcgis-to-geojson';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Polygon from '@arcgis/core/geometry/Polygon';
import { geomFromPointRadiusArea } from './geomFromPoint';
import * as projection from '@arcgis/core/geometry/projection.js';
import { discernProjection } from '../../utils/upload.utils';
import { locationsPage, convertURL } from '../../../../common/js/config';

export const parseZip = (file) => {
  return discernProjection(file)
    .then((projDefs) => {
      if (!projDefs[0]) {
        const formData = new FormData();
        formData.append('file', file);

        return axios
          .post(convertURL, formData)
          .then((response) => {
            const data = response.data.data;
            let geom;
            const oldSpatialRef = new SpatialReference({ wkid: projDefs[1] });
            const newSpatialRef = SpatialReference.WGS84;
            return projection.load().then(() => {
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
                  geom = geomFromPointRadiusArea(
                    projectedCenterPoint,
                    feat.properties.Analysis_R,
                    feat.properties.Analysis_A
                  );
                }

                return { geom, isUploading: false };
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
