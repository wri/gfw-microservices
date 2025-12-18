const { format: formatDate } = require('date-fns');
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Utils
const { getListVectorTileS3PathDB } = require('./vectorTileDB.utils');
const { deletingMBTileFromS3Bucket } = require('./vectorTileS3.utils');
const sqlUtils = require('../../../config/privateutils/sql.utils');

// Config
const { VECTOR_TILES_LOCATION } = require('../config/vectorTiles.config');

// Global
const logger = require('../../../config/privateutils/logger.utils');

/**
 * @description - Delete MBTile Vector Tiles from S3 Bucket, local cache, and clear the database reference
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} listID - List ID
 * @return {Promise<void>}
 */
exports.removeExistingVectorTileFromS3 = async (req, listID) => {
  const currentVectorTileS3Path = await getListVectorTileS3PathDB(req, listID);

  if (currentVectorTileS3Path) {
    // 1. Remove old MBTile Vector Tiles from S3 Bucket
    await deletingMBTileFromS3Bucket(currentVectorTileS3Path);

    // 2. Remove the local cached mbtile file if it exists
    const mbtileFileName = path.basename(currentVectorTileS3Path);
    const localMbtileFilePath = path.join(VECTOR_TILES_LOCATION, mbtileFileName);

    if (fs.existsSync(localMbtileFilePath)) {
      try {
        fs.unlinkSync(localMbtileFilePath);
        logger.info(`Deleted local cached mbtile file: ${localMbtileFilePath}`);
      } catch (err) {
        logger.error(`Failed to delete local mbtile file ${localMbtileFilePath}: ${err}`);
        // Don't throw - continue with DB cleanup even if local file deletion fails
      }
    }

    // 3. Clear the vector_tiles_storage_path in the database
    const parameters = [
      { field: 'list_id', type: sql.Int, value: listID },
      { field: 'column_name', type: sql.NVarChar(sql.MAX), value: 'vector_tiles_storage_path' },
      { field: 'value', type: sql.NVarChar(sql.MAX), value: null },
    ];

    await sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspUpdateListStringResult', parameters)
      .catch((err) => {
        logger.error(`Failed to clear vector_tiles_storage_path in DB for list ${listID}: ${err}`);
        throw new Error('Failed to clear vector tile path from database');
      });

    logger.info(`Removed vector tiles (S3, local cache, and DB path) for list ID: ${listID}`);
  } else {
    logger.info('No Vector Tile exists for list ID:', listID);
  }
};

/**
 * @description - Get Current Date Time Formatted
 *
 * @return {string}
 */
exports.getCurrentDateTimeFormatted = () => {
  return formatDate(new Date(), 'yyyyMMdd_HHmmss');
};
