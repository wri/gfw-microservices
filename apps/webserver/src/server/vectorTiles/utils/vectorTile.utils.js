const moment = require('moment');

// Utils
const { getListVectorTileS3PathDB } = require('./vectorTileDB.utils');
const { deletingMBTileFromS3Bucket } = require('./vectorTileS3.utils');

// Global
const logger = require('../../../config/privateutils/logger.utils');

/**
 * @description - Delete MBTile Vector Tiles from S3 Bucket if exists
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} listID - List ID
 * @return {Promise<void>}
 */
exports.removeExistingVectorTileFromS3 = async (req, listID) => {
  const currentVectorTileS3Path = await getListVectorTileS3PathDB(req, listID);

  if (currentVectorTileS3Path) {
    // Remove old MBTile Vector Tiles from S3 Bucket
    await deletingMBTileFromS3Bucket(currentVectorTileS3Path);
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
  const isoDateString = moment().toISOString();
  return moment(isoDateString).format('YYYYMMDD_HHmmss');
};
