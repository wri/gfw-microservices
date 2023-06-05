const fs = require('fs');
const path = require('path');
const { v4: uuidV4 } = require('uuid');

// Utils
const { createTempGeojsonFiles } = require('./vectorTileGeojson.utils');
const { createTippecanoeMBTiles } = require('./vectorTileTippecanoe.utils');
const {
  getListVectorTileS3PathDB,
  updateListVectorTilesStoragePathDB,
} = require('./vectorTileDB.utils');
const { uploadMBTileToS3Bucket, deletingMBTileFromS3Bucket } = require('./vectorTileS3.utils');

// Configs
const {
  VECTOR_TILES_TEMP_LOCATION,
  VECTOR_TILES_LOCATION,
} = require('../config/vectorTiles.config');

// Global
const logger = require('../../../config/lib/winston');
const ListManager = require('../../../config/publicutils/listManager.utils');

/**
 * @description - Generate MBTiles Vector Tiles for a List and store in S3 Bucket
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} listID - List ID
 * @return {Promise<{message: string}>}
 */
exports.generateAndStoreVectorTiles = async (req, listID) => {
  const userLists = req.session.isNodeServer
    ? await ListManager.getAllLists(req)
    : await ListManager.getUserLists(req);
  const listInfo = userLists.find((list) => {
    return list.id === listID;
  });

  // check for SQS message timestamp against existing database timestamp to avoid re-generating *vector tiles
  if (req.session.isNodeServer && req.messageTimestamp) {
    const calculateMinutesDifference = (messageTime, databaseTime) => {
      const queueTime = new Date(messageTime);
      const lastUpdatedTime = databaseTime;
      const minutesDifference = (queueTime.getTime() - lastUpdatedTime.getTime()) / 1000 / 60;
      return minutesDifference;
    };
    if (
      listInfo.vector_tiles_last_updated instanceof Date &&
      isFinite(listInfo.vector_tiles_last_updated.getTime())
    ) {
      const minutesDifference = calculateMinutesDifference(
        req.messageTimestamp,
        listInfo.vector_tiles_last_updated
      );
      if (minutesDifference > 0 && minutesDifference < 5) {
        const failedMessage = `Vector Tiles already generated for this list: ${listID}. (Last updated: ${listInfo.vector_tiles_last_updated})`;
        logger.info(failedMessage);
        return { message: failedMessage, lastUpdatedTime: listInfo.vector_tiles_last_updated };
      }
    }
  }
  const uuidString = uuidV4().replace(/-/g, '_');
  const tempFilesPath = path.join(VECTOR_TILES_TEMP_LOCATION, `list-${listID}`);
  const numberOfLocations = listInfo.list_locations_count;

  // Create Temp Geojson Files
  await createTempGeojsonFiles(req, numberOfLocations, uuidString, tempFilesPath, listID);

  // Create Temp MBTiles File
  const { mbtileFileName, mbtileOutputFilePath } = await createTippecanoeMBTiles({
    listID,
    numberOfLocations,
    tempFilesPath,
    uuidString,
  });

  if (mbtileOutputFilePath) {
    const currentVectorTileS3Path = await getListVectorTileS3PathDB(req, listID);

    logger.info('Updating MBTile Vector Tiles in S3 - Start');
    const { mbtileS3FilePath } = await uploadMBTileToS3Bucket(mbtileFileName, mbtileOutputFilePath);
    await updateListVectorTilesStoragePathDB(req, listID, mbtileS3FilePath);

    if (currentVectorTileS3Path) {
      // Remove old MBTile Vector Tiles from S3 Bucket
      await deletingMBTileFromS3Bucket(currentVectorTileS3Path);
    }

    // Copy MBTile File to Permanent Location
    const mbtileOldPath = mbtileOutputFilePath;
    const mbtileNewPath = path.join(VECTOR_TILES_LOCATION, mbtileFileName);
    fs.copyFile(mbtileOldPath, mbtileNewPath, (err) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info(`Successfully copied ${mbtileFileName} to: ${VECTOR_TILES_LOCATION}`);

        // Remove temp Geojson files
        fs.rmSync(tempFilesPath, { recursive: true, force: true });
      }
    });

    logger.info('Updating MBTile Vector Tiles in S3 - End');
    const successMessage = `Vector Tile generated: ${mbtileS3FilePath}`;
    return { message: successMessage, path: mbtileS3FilePath };
  }

  const errorMessage = 'Generating Vector Tiles failed';
  logger.error(errorMessage);
  throw new Error(errorMessage);
};
