import * as GeometryEngine from '@arcgis/core/geometry/geometryEngine';
import * as XLSX from 'xlsx';
import Point from '@arcgis/core/geometry/Point';
import { geocodeMill } from './geocodeMill';
import { locationsPage } from '../../../../common/js/config';

export const parseXlsx = (inputFile, activeTemplate) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = !e ? reader.content : e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const jsonVar = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        const feature = jsonVar[0];

        if (activeTemplate === 'palmMill' || (feature.ID && !feature.Latitude)) {
          geocodeMill(feature).then((feat) => {
            if (feat) {
              let point;
              if (feat.properties.Analysis_R) {
                point = GeometryEngine.geodesicBuffer(
                  feat.geometry,
                  parseFloat(feat.properties.Analysis_R),
                  'kilometers'
                );
              } else {
                const kilosSquared = feat.properties.Analysis_A / 100;
                const kilos = Math.sqrt(kilosSquared / Math.PI);
                point = GeometryEngine.geodesicBuffer(
                  feat.geometry,
                  kilos.toFixed(2),
                  'kilometers'
                );
              }
              resolve({ geometry: point, isUploading: false });
            } else {
              reject({
                dialogOpen: true,
                dialogTitle: 'Incorrect Mill ID',
                dialogMessage:
                  'The ID column that you provided does not match any known mill, please upload a valid "wri_id".',
              });
            }
          });
        } else {
          const point = new Point({
            latitude: parseInt(feature.Latitude),
            longitude: parseInt(feature.Longitude),
            spatialReference: { wkid: 4326 },
          });

          let geom;
          if (feature['Analysis Radius']) {
            geom = GeometryEngine.geodesicBuffer(
              point,
              parseFloat(feature['Analysis Radius']),
              'kilometers'
            );
          } else if (feature['Analysis Area']) {
            const kilosSquared = feature['Analysis Area'] / 100;
            const kilos = Math.sqrt(kilosSquared / Math.PI);
            geom = GeometryEngine.geodesicBuffer(point, kilos.toFixed(2), 'kilometers');
          } else {
            console.warn('missing both radius and area, which is not allowed');
            geom = GeometryEngine.geodesicBuffer(point, 2, 'kilometers');
          }

          if (!geom) {
            reject({
              isUploading: false,
              dialogOpen: true,
              dialogTitle: locationsPage.upload.errors.excelTitle,
              dialogMessage: locationsPage.upload.errors.excelMessage,
            });
            return;
          }

          resolve({ geometry: geom, isUploading: false });
        }
      } catch (error) {
        reject({
          dialogOpen: true,
          dialogTitle: 'Excel parsing error',
          dialogMessage: 'The Excel file was parsed incorrectly, please upload a valid file.',
        });
        console.error(`Error: ${error}`);
      }
    };

    reader.onerror = (err) => {
      reject({
        dialogOpen: true,
        dialogTitle: 'Excel parsing error',
        dialogMessage: 'The Excel file was parsed incorrectly, please upload a valid file.',
      });
      console.log(`Error: ${err}`);
    };

    reader.readAsBinaryString(inputFile);
  });
};
