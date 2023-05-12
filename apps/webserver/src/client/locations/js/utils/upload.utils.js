import Deferred from 'dojo/Deferred';
import JSZip from 'jszip';
import { locationsPage } from '../../../common/js/config';
import {
  spatialReferenceDictionary__PROJ,
  spatialReferenceDictionary__GCS,
} from '../../../common/js/config-projections';

export const maxFileSizeBytes = 5000000;
export const maxFileSizeMB = maxFileSizeBytes / 1000 / 1000;
export const maxLocations = 1500;

// Check to see which views should be enabled
export const discernProjection = (file) => {
  const deferred = new Deferred();

  JSZip.loadAsync(file).then(
    (zip) => {
      let foundProj = false;
      let errMessage = '';
      for (const property in zip.files) {
        const localFile = zip.files[property];

        if (localFile.name.indexOf('.prj') > -1) {
          // Denote that we've found a .prj file and don't need to engage the fallback promise
          // resolution below for when a .prj file is not present.
          foundProj = true;
          zip.files[localFile.name]
            .async('string')
            .then((unzippedProj) => {
              let geogCS;
              // if projection exists
              if (unzippedProj.indexOf('PROJCS["') > -1) {
                const projSplit = unzippedProj.split('PROJCS["')[1];
                geogCS = spatialReferenceDictionary__PROJ[projSplit.split('",')[0]];
              }
              // if GCS exists
              else if (unzippedProj.indexOf('GEOGCS["') > -1) {
                const projSplit = unzippedProj.split('GEOGCS["')[1];
                geogCS = spatialReferenceDictionary__GCS[projSplit.split('",')[0]];
              } else if (unzippedProj.indexOf('PROJCS["') === -1 && unzippedProj.indexOf('GEOGCS["') === -1) {
                errMessage = locationsPage.upload.errors.zipfile;
              }
              deferred.resolve([errMessage, geogCS]);
            })
            .catch((ex) => {
              errMessage = locationsPage.upload.errors.zipfile;
              console.warn(errMessage);
              deferred.resolve([errMessage, null]);
            });
        }
      }

      // If no .prj file is discovered at all, resolve with an error.
      if (!foundProj) {
        errMessage = locationsPage.upload.errors.zipfile;
        deferred.resolve([errMessage, null]);
      }
    },
    function (e) {
      deferred.resolve([locationsPage.upload.errors.zipfile, null]);
    }
  );

  return deferred;
};

export const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};
