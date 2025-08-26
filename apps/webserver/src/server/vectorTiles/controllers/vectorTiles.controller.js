const fs = require('fs');
const path = require('path');
const MBTiles = require('@mapbox/mbtiles');
const sql = require('mssql');
const sqlUtils = require('../../../config/privateutils/sql.utils');

// Logger
const logger = require('../../../config/privateutils/logger.utils');

// Utils
const { generateAndStoreVectorTiles } = require('../utils/vectorTileGenerate.utils');
const { getTileUsingZoomAndPosition } = require('../utils/vectorTileRetrieve.utils');
const { getListVectorTileS3PathDB } = require('../utils/vectorTileDB.utils');
const { getMBTileFromS3Bucket } = require('../utils/vectorTileS3.utils');

// Config
const { VECTOR_TILES_LOCATION, MBTILE_EXTENSION } = require('../config/vectorTiles.config');

exports.deleteTiles = async (req, res) => {
  logger.info(`/vectorTile/deleteTiles - Request => Query PARAMS: ${JSON.stringify(req.body)}`);
  const { listID } = req.body;
  if (isNaN(listID)) {
    return res.status(400).json({
      success: false,
      message: 'listID must be a number.',
    });
  }
  try {
    await sqlUtils.executeOrganizationStoredProcedure(req, 'uspDeleteListVectorTilesPath', [
      { field: 'list_id', type: sql.Int, value: listID },
    ]);
    res.status(200).json({
      success: true,
      message: 'List vector tiles storage path deleted successfully.',
    });
  } catch (err) {
    const errorMessage = 'Deleting List Vector Tiles Storage Path in DB failed';
    logger.error(`${errorMessage}: ${err}`);
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: err.message,
    });
  }
};

/**
 * @description - Generate MBTiles
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.generateTiles = async (req, res) => {
  logger.info(`/vectorTile/generateTiles - Request => Query PARAMS: ${JSON.stringify(req.body)}`);
  const { listID } = req.body;

  generateAndStoreVectorTiles(req, listID)
    .then((response) => {
      res.status(200).json({
        success: true,
        message: response.message,
      });
    })
    .catch((response) => {
      res.status(422).json({
        success: false,
        message: response.message,
      });
    });
};

/**
 * @description - API returns the appropriate tiles for that list for the selected area and zoom level
 *
 * @param {Object} request - Express request
 * @param {Object} response - Express response
 * @return {Promise} - request Promise
 */
exports.retrieveTiles = async (request, response) => {
  logger.info(
    `[GET] /vectorTile/:id => PARAMS: ${JSON.stringify(
      request.params
    )} Query PARAMS: ${JSON.stringify(request.query)}`
  );

  const { id: listID } = request.params;
  const { latitude, longitude, zoom } = request.query;

  if (latitude === undefined || zoom === undefined || longitude === undefined) {
    return response
      .status(400)
      .json({ success: false, message: 'you have to inform latitude, longitude and zoom.' });
  }

  getTileUsingZoomAndPosition(request, listID, latitude, longitude, zoom)
    .then((tiles) => {
      const [headers, data] = tiles;
      return response.status(200).header(headers).send(data);
    })
    .catch((error) => {
      return response.status(422).json({
        success: false,
        message: error.message,
      });
    });
};

/**
 * @description Get List MBTile file info
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express request
 */
exports.getListMbtileInfo = async (req, res) => {
  const { listID } = req.body;

  try {
    const localMbtileFilePath = await exports.prepareMbtileFile(req, listID);
    const listMbtileFileName = path.basename(localMbtileFilePath);
    const listMbtileFileNameOnly = path.basename(listMbtileFileName, MBTILE_EXTENSION);
    new MBTiles(`${localMbtileFilePath}?mode=ro`, (err, mbtiles) => {
      if (err) {
        logger.error(`new MBTiles Error on ${localMbtileFilePath}?mode=ro`, err);
      }

      mbtiles.getInfo((getInfoError, data) => {
        if (getInfoError) {
          logger.error(`mbtiles.getInfo Error`, getInfoError);
        }

        res.status(200).json({
          bounds: data?.bounds, // an empty array makes the map go blank
          maxZoom: data?.maxzoom || 0,
          minZoom: data?.minzoom || 0,
          listMbtileFileName,
          listMbtileFileNameOnly,
          success: data?.filesize,
          errors: {
            mbTileError: err,
            getInfoError,
          },
        });
      });
    });
  } catch (error) {
    logger.error('Error getting list Mbtile Info:', error);
    res.status(422).json({
      message: 'Error getting list Mbtile Info',
      success: false,
      error: error?.message,
    });
  }
};

exports.prepareMbtileFile = async (req, listID, mbtileFileName = null) => {
  let listVectorTileS3Path;

  if (mbtileFileName) {
    // Use the given mbtile file name as the S3 path
    listVectorTileS3Path = mbtileFileName;
  } else {
    // If no mbtile file name is provided, fetch it from the database
    listVectorTileS3Path = await getListVectorTileS3PathDB(req, listID);
    if (listVectorTileS3Path === null) {
      // If the S3 path is not found, generate and store the vector tiles
      const { path: tilePath } = await generateAndStoreVectorTiles(req, listID);
      listVectorTileS3Path = tilePath;
    }
  }
  const mbtileName = path.basename(listVectorTileS3Path);
  const localMbtileFilePath = path.join(VECTOR_TILES_LOCATION, mbtileName);

  if (!fs.existsSync(localMbtileFilePath)) {
    // If the file does not exist, download it
    await getMBTileFromS3Bucket(listVectorTileS3Path);
  }

  try {
    await waitForMbtileReady(localMbtileFilePath);
  } catch (error) {
    logger.warn(`First waitForMbtileReady failed: ${error.message}`);
    logger.warn('Retrying download from S3...');

    try {
      await getMBTileFromS3Bucket(listVectorTileS3Path);
      await waitForMbtileReady(localMbtileFilePath);
    } catch (retryError) {
      console.error('Retry also failed:', retryError);
      throw retryError;
    }
  }

  return localMbtileFilePath;
};

async function waitForMbtileReady(filePath, retries = 5, delay = 1000) {
  return new Promise((resolve, reject) => {
    if (retries <= 0) {
      logger.error(
        `MBTiles file still empty or incomplete after multiple retries. Deleting file: ${filePath}`
      );
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`Deleted zero-byte file: ${filePath}`);
        }
      } catch (err) {
        logger.error(`Failed to delete zero-byte file: ${filePath}`, err);
      }
      return reject(new Error('MBTiles file is still empty or incomplete after multiple checks.'));
    }

    setTimeout(() => {
      try {
        const fileStats = fs.statSync(filePath);
        if (fileStats.size > 0) {
          return resolve();
        } else {
          logger.warn(`MBTiles file is still empty, retrying... (${retries - 1} retries left)`);
          resolve(waitForMbtileReady(filePath, retries - 1, delay));
        }
      } catch (error) {
        return reject(error);
      }
    }, delay);
  });
}
