const fs = require('fs');
const path = require('path');
const MBTiles = require('@mapbox/mbtiles');

// Logger
const logger = require('../../../config/privateutils/logger.utils');

// Utils
const { generateAndStoreVectorTiles } = require('../utils/vectorTileGenerate.utils');
const { getTileUsingZoomAndPosition } = require('../utils/vectorTileRetrieve.utils');
const { getListVectorTileS3PathDB } = require('../utils/vectorTileDB.utils');
const { getMBTileFromS3Bucket } = require('../utils/vectorTileS3.utils');

// Config
const { VECTOR_TILES_LOCATION, MBTILE_EXTENSION } = require('../config/vectorTiles.config');

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
    let listVectorTileS3Path = await getListVectorTileS3PathDB(req, listID);

    if (listVectorTileS3Path === null) {
      const { path: tilePath } = await generateAndStoreVectorTiles(req, listID);
      listVectorTileS3Path = tilePath;
    }

    const mbtileFileName = path.basename(listVectorTileS3Path);
    const mbtileFileNameOnly = path.basename(mbtileFileName, MBTILE_EXTENSION);
    const localMbtileFilePath = path.join(VECTOR_TILES_LOCATION, mbtileFileName);

    if (!fs.existsSync(localMbtileFilePath)) {
      await getMBTileFromS3Bucket(listVectorTileS3Path);
    }

    // check and wait for file to be ready
    await waitForMbtileReady(localMbtileFilePath);

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
          listMbtileFileName: mbtileFileName,
          listMbtileFileNameOnly: mbtileFileNameOnly,
          success: data?.filesize,
          errors: {
            mbTileError: err,
            getInfoError,
          },
        });
      });
    });
  } catch (e) {
    res.status(422).json({
      message: 'Error getting list Mbtile Info',
      success: false,
    });
  }
};

async function waitForMbtileReady(filePath, retries = 5, delay = 500) {
  return new Promise((resolve, reject) => {
    if (retries <= 0) {
      return reject(new Error('MBTiles file is still empty or incomplete after multiple checks.'));
    }

    setTimeout(() => {
      try {
        const fileStats = fs.statSync(filePath);
        if (fileStats.size > 0) {
          return resolve();
        } else {
          resolve(waitForMbtileReady(filePath, retries - 1, delay));
        }
      } catch (error) {
        return reject(error);
      }
    }, delay);
  });
}
