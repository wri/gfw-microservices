const sql = require('mssql');
const logger = require('../../../config/privateutils/logger.utils');
const sqlUtils = require('../../../config/privateutils/sql.utils');

/**
 * @description - Update List `vector_tiles_storage_path` in DB
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} listID - List ID
 * @param {string} mbtileS3FilePath - MBTile S3 file path
 * @return {Promise<*|Array>}
 */
exports.updateListVectorTilesStoragePathDB = async (req, listID, mbtileS3FilePath) => {
  const spParamsVectorTilesStoragePath = [
    { field: 'list_id', type: sql.Int, value: listID },
    { field: 'column_name', type: sql.NVarChar(sql.MAX), value: 'vector_tiles_storage_path' },
    { field: 'value', type: sql.NVarChar(sql.MAX), value: mbtileS3FilePath },
  ];

  await sqlUtils
    .executeOrganizationStoredProcedure(
      req,
      'uspUpdateListStringResult',
      spParamsVectorTilesStoragePath
    )
    .catch((err) => {
      const errorMessage = 'Updating List Vector Tiles Storage Path in DB failed';
      logger.error(`${errorMessage}: ${err}`);
      throw new Error(errorMessage);
    });

  const spParamsVectorTilesLastUpdated = [
    { field: 'list_id_array', type: sql.NVarChar(sql.MAX), value: listID },
    { field: 'column_name', type: sql.NVarChar(sql.MAX), value: 'vector_tiles_last_updated' },
    { field: 'value', type: sql.DateTime, value: new Date() },
  ];

  await sqlUtils
    .executeOrganizationStoredProcedure(
      req,
      'uspSetDashboardTimestamp',
      spParamsVectorTilesLastUpdated
    )
    .catch((err) => {
      const errorMessage = 'Updating List Vector Tiles last updated in DB failed';
      logger.error(`${errorMessage}: ${err}`);
      throw new Error(errorMessage);
    });
};

/**
 * @description - Get List `vector_tiles_storage_path` from DB
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} listID - List ID
 * @return {string|null}
 */
exports.getListVectorTileS3PathDB = async (req, listID) => {
  const spParams = [{ field: 'list_id', type: sql.Int, value: listID }];
  const [result] = await sqlUtils
    .executeOrganizationStoredProcedure(req, 'uspGetListVectorTilesPath', spParams)
    .catch((err) => {
      const errorMessage = 'Getting List Vector Tiles S3 Path from DB failed';
      logger.error(`${errorMessage}: ${err}`);
      throw new Error(errorMessage);
    });

  if (result && result.vector_tiles_storage_path) {
    return result.vector_tiles_storage_path;
  }

  return null;
};
