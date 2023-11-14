const fs = require('fs');
const _ = require('lodash');
const path = require('path');

// Configs
const {
  DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED,
} = require('../../../config/config/locations.config');

// Utils
const { getCurrentDateTimeFormatted } = require('./vectorTile.utils');
const ListManager = require('../../../config/publicutils/listManager.utils');

// Globals
const logger = require('../../../config/privateutils/logger.utils');

/**
 * @description - Getting List Geojson for list ID
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} listID - List ID
 * @param {number} locationID - Start Location ID
 * @return {Promise<Object>} Geojson
 */
const getListGeojson = async (req, listID, locationID = 0) => {
  const listIDNumber = Number(listID);
  logger.info(`Getting List Geojson for list ID: ${listIDNumber}`);
  const geojson = await ListManager.getListLocations(req, listID, locationID).catch((err) => {
    const errorMessage = `Getting List Geojson for list ID: ${listID} failed`;
    logger.error(`${errorMessage}: ${err}`);
    throw new Error(errorMessage);
  });

  return geojson;
};

/**
 * @description - Create Temp Geojson File
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {string} uuidString - UUID String (e.g. '6073ee57_7ce4_45a3_84e7_b7403b958b5c')
 * @param {string} tempFilesPath - Temp files path (e.g. '/tmp/list-1385/')
 * @param {number} listID - List ID (e.g. 1385)
 * @param {number} locationID - Start Location ID
 * @return {Promise<Object>} - Promise resolved with temp file name and path/rejected with error message
 */
const createTempGeojsonFile = async (req, uuidString, tempFilesPath, listID, locationID = 0) => {
  const geojson = await getListGeojson(req, listID, locationID);

  return new Promise((resolve, reject) => {
    const currentDateTimeFormatted = getCurrentDateTimeFormatted();
    const numberOfLocations = geojson.features.length;
    const lastLocationID = geojson.features[numberOfLocations - 1].properties.location_id + 1;

    // Create temp directory if not exists
    fs.mkdirSync(tempFilesPath, { recursive: true });

    const tempFileName = `${currentDateTimeFormatted}_${numberOfLocations}_${listID}_${uuidString}`;
    const tempFileNameGeojson = `${tempFileName}.geojson`;
    const tempFileNameGeojsonPath = path.join(tempFilesPath, tempFileNameGeojson);

    const data = JSON.stringify(geojson);
    fs.writeFile(tempFileNameGeojsonPath, data, (err) => {
      if (err) {
        const errorMessage = 'Creating Temp Geojson file failed';
        logger.error(`${errorMessage}: ${err}`);
        reject(new Error(errorMessage));
      }

      logger.info(`Geojson for list ID: ${listID} written to file - ${tempFileNameGeojsonPath}`);
      resolve({ lastLocationID });
    });
  });
};

/**
 * @description - Create Temp Geojson Files
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {string} uuidString - UUID String (e.g. '6073ee57_7ce4_45a3_84e7_b7403b958b5c')
 * @param {string} tempFilesPath - Temp files path (e.g. '/tmp/list-1385/')
 * @param {number} listID - List ID (e.g. 1385)
 * @param {number} numberOfLocations - Number of locations in list (e.g. 64)
 * @return {Promise<void>}
 */
const createTempGeojsonFiles = async (
  req,
  numberOfLocations,
  uuidString,
  tempFilesPath,
  listID
) => {
  const numberOfChunks = Math.ceil(numberOfLocations / DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED);
  const numberOfChunksArray = _.range(numberOfChunks);
  let startLocationID = 0;

  // Split list in to chunks and create temp geojson files
  // eslint-disable-next-line no-unused-vars,no-restricted-syntax
  for await (const chunk of numberOfChunksArray) {
    const currentChunk = `${chunk + 1}/${numberOfChunksArray.length}`;
    const locationsFrom = chunk * DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED + 1;
    const locationsTo =
      chunk !== numberOfChunksArray.length - 1
        ? (chunk + 1) * DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED
        : numberOfLocations;
    logger.info(
      `Working on chunk ${currentChunk}. Locations from ${locationsFrom} to ${locationsTo} will be processed out of ${numberOfLocations} locations`
    );
    const { lastLocationID } = await createTempGeojsonFile(
      req,
      uuidString,
      tempFilesPath,
      listID,
      startLocationID
    );
    startLocationID = lastLocationID;
  }
};

module.exports = {
  createTempGeojsonFile,
  createTempGeojsonFiles,
};
