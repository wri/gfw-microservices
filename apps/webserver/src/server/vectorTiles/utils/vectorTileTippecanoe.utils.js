const fs = require('fs');
const path = require('path');
const { tippecanoeAsync } = require('tippecanoe');

// Utils
const { getCurrentDateTimeFormatted } = require('./vectorTile.utils');

// Configs
const logger = require('../../../config/lib/winston');
const { MBTILE_EXTENSION } = require('../config/vectorTiles.config');

/**
 * @description - Create MBTiles
 *
 * @param {number} listID - List ID (e.g. 1385)
 * @param {number} numberOfLocations - Number of locations in list (e.g. 64)
 * @param {string} tempFilesPath - Temp files path (e.g. '/tmp/list-1385/')
 * @param {string} uuidString - UUID String (e.g. '6073ee57_7ce4_45a3_84e7_b7403b958b5c')
 * @return {Promise<unknown>} - Promise resolved with { mbtileOutputFilePath }/rejected with error message
 */
exports.createTippecanoeMBTiles = async ({ listID, numberOfLocations, tempFilesPath, uuidString }) => {
  return new Promise((resolve, reject) => {
    const geojsonFiles = fs.readdirSync(tempFilesPath);
    const geojsonFilesWithPath = geojsonFiles
      .filter((file) => {
        return file.includes(uuidString);
      })
      .map((file) => {
        return path.join(tempFilesPath, file);
      });

    const currentDateTimeFormatted = getCurrentDateTimeFormatted();
    const tempFileName = `${currentDateTimeFormatted}_${numberOfLocations}_${listID}_${uuidString}`;
    const mbtileFileName = `${tempFileName}${MBTILE_EXTENSION}`;
    const mbtileOutputFilePath = path.join(tempFilesPath, mbtileFileName);

    tippecanoeAsync(
      geojsonFilesWithPath,
      {
        layer: tempFileName,
        output: mbtileOutputFilePath,
        readParallel: true, // '--read-parallel'
        noTileSizeLimit: true, // '--no-tile-size-limit
        // minimumZoom: 0,
        // maximumZoom: 22,
        // zg: true,
        // simplification: 10,
        // description: 'Generate MBTiles Vector Tiles for a List and store in S3 Bucket description.'
      },
      { echo: true }
    )
      .then(() => {
        logger.info(`Vector Tiles created: ${mbtileOutputFilePath}`);
        resolve({ mbtileOutputFilePath, mbtileFileName });
      })
      .catch((err) => {
        const errorMessage = 'Generating Vector Tiles failed';
        logger.error(`${errorMessage}: ${err}`);
        reject(new Error(errorMessage));
      });
  });
};
