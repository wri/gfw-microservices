const path = require('path');
const MBTiles = require('@mapbox/mbtiles');

const { esriVectorTileRoot } = require('../templates/esri-vector-tile-root');
const { esriVectorTileMetadata } = require('../templates/esri-vector-tile-metadata');
const { VECTOR_TILES_LOCATION, MBTILE_EXTENSION } = require('../config/vectorTiles.config');

/**
 * @description Get ESRI Vector Tile Root config
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getEsriVectorTileRoot = (req, res) => {
  res.send(esriVectorTileRoot);
};

/**
 * @description Get ESRI Vector Tile Metadata config
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getEsriVectorTileMetadata = (req, res) => {
  res.send(esriVectorTileMetadata);
};

/**
 * Handle PBF Request
 * Expects urls in the format: /{Z}/{X}/{Y}.pbf
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {*}
 */
exports.handleVectorTilePbfRequest = async (req, res) => {
  const { mbtile, z, x, y } = req.params;

  // Define period in second, this one is 60 * 60 * 24 = 86_400 (1 day)
  const CACHE_PERIOD = 60 * 60 * 24;

  try {
    const localMbtileFilePath = path.join(VECTOR_TILES_LOCATION, `${mbtile}${MBTILE_EXTENSION}`);

    new MBTiles(localMbtileFilePath, (err, mbtiles) => {
      mbtiles.getTile(z, x, y, (error, data, headers) => {
        // Request response
        // https://github.com/mapbox/mbview/blob/b1b6d6fa9fcb05d62f858def7dcf360a90c695cc/mbview.js#L82-L90
        if (error) {
          res.status(422).send();
        } else {
          const headersUpdated = {
            'Cache-Control': `max-age=${CACHE_PERIOD}`,
            ...headers,
          };

          res.writeHead(200, headersUpdated);
          res.end(data);
        }
      });
    });
  } catch (e) {
    res.status(422).send();
  }
};
