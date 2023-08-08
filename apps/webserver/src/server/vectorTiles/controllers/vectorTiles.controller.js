const fs = require('fs');
const path = require('path');
const MBTiles = require('@mapbox/mbtiles');

// Logger
const logger = require('../../../config/lib/winston');
const slackNotifications = require('../../../config/privateutils/slackNotifications.utils');

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
 * @param {Object} req - Express request
 * @param {Object} res - Express response
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
 * @return {Promise<{mbtileFileName: string}>}
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
    new MBTiles(`${localMbtileFilePath}?mode=ro`, (err, mbtiles) => {
      mbtiles.getInfo((getInfoError, data) => {
        if (data?.filesize === 0) {
          slackNotifications.sendNotification('getListMbtileInfo error', {
            listID,
            err,
            mbtilesFilename: mbtiles?.filename,
            getInfoError,
            data,
          });
        }

        res.status(200).json({
          bounds: data?.bounds || [],
          maxZoom: data?.maxzoom || 0,
          minZoom: data?.minzoom || 0,
          listMbtileFileName: mbtileFileName,
          listMbtileFileNameOnly: mbtileFileNameOnly,
          success: data?.filesize,
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
