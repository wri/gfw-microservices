/* eslint-disable no-new */
const fs = require('fs');
const path = require('path');
const MBTiles = require('@mapbox/mbtiles');

const { info } = require('console');
const { getListVectorTileS3PathDB } = require('./vectorTileDB.utils');
const { VECTOR_TILES_LOCATION } = require('../config/vectorTiles.config');
const { getMBTileFromS3Bucket } = require('./vectorTileS3.utils');
const { generateAndStoreVectorTiles } = require('./vectorTileGenerate.utils');

const lon2tile = (lon, zoom) => {
  return Math.floor(((lon + 180) / 360) * 2 ** zoom);
};

const lat2tile = (lat, zoom) => {
  return Math.floor(
    ((1 -
      Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) /
      2) *
      2 ** zoom
  );
};

const getPathFromDatabase = async (request, listID) => {
  let tileFiles = await getListVectorTileS3PathDB(request, listID);
  if (tileFiles == null) {
    const { path: tilePath } = await generateAndStoreVectorTiles(request, listID);
    tileFiles = tilePath;
  }
  const mbtileFileName = path.basename(tileFiles);
  const mbtileFilePath = path.join(VECTOR_TILES_LOCATION, mbtileFileName);
  if (!fs.existsSync(mbtileFilePath)) {
    await getMBTileFromS3Bucket(tileFiles);
  }
  return mbtileFilePath;
};

exports.getTileUsingZoomAndPosition = async (request, listID, latitude, longitude, zoom) => {
  const tileFiles = await getPathFromDatabase(request, listID);

  const x = lon2tile(longitude, zoom);
  const y = lat2tile(latitude, zoom);

  const mp = new Promise((resolve) => {
    new MBTiles(`${tileFiles}?mode=ro`, (err, mbtiles) => {
      info(err);
      mbtiles.getTile(zoom, x, y, (error, data, headers) => {
        info(error);
        resolve([headers, data]);
      });
    });
  });

  return mp
    .then((tile) => {
      return tile;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};
