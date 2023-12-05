const fs = require('fs');
const path = require('path');
const { writeFile } = require('node:fs/promises');
const AWS = require('@aws-sdk/client-s3');

const logger = require('../../../config/privateutils/logger.utils');
const {
  VECTOR_TILES_LOCATION,
  MBTILE_S3_BUCKET,
  MBTILE_S3_BUCKET_NAME,
  MBTILE_S3_BUCKET_PATH,
} = require('../config/vectorTiles.config');

/**
 * @description - Upload MBTile to S3 Bucket
 *
 * @param {string} mbtileFileName - MBTile file name (e.g. '20221013_103819_64_1385_0d1e3e41_20ba_48fe_adb7_fd5ed166fe72.mbtiles')
 * @param {string} mbtileOutputFilePath - MBTile output file path (e.g. '/tmp/20221013_103819_64_1385_0d1e3e41_20ba_48fe_adb7_fd5ed166fe72.mbtiles')
 * @return {Promise<{mbtileS3FilePath: string}>} - Promise resolved with { mbtileS3FilePath }/rejected with error message
 */
exports.uploadMBTileToS3Bucket = async (mbtileFileName, mbtileOutputFilePath) => {
  return new Promise((resolve, reject) => {
    const mbtileFileContent = fs.readFileSync(mbtileOutputFilePath);
    const s3 = new AWS.S3();

    const s3ObjectKeyPath = path.join(MBTILE_S3_BUCKET_PATH, mbtileFileName);

    const params = {
      Bucket: MBTILE_S3_BUCKET_NAME,
      Key: s3ObjectKeyPath,
      Body: mbtileFileContent,
      ContentType: 'application/x-sqlite3',
    };

    s3.putObject(params, (err, data) => {
      if (err) {
        const errorMessage = `MBTile addition to S3 bucket failed !!! ${JSON.stringify(err)}`;
        logger.error(errorMessage);
        reject(new Error(errorMessage));
      } else {
        const mbtileS3FilePath = `${MBTILE_S3_BUCKET}/${mbtileFileName}`;
        logger.info(`MBTile uploaded to S3 bucket - ${mbtileS3FilePath}`);
        resolve({ mbtileS3FilePath });
      }
    });
  });
};

/**
 * @description - Deleting MBTile from S3
 *
 * @param {string} listVectorTileS3Path - MBTile S3 file name
 * @return {Promise<unknown>} - Promise resolved with { oldMBTileS3FilePath }/rejected with error message
 */
exports.deletingMBTileFromS3Bucket = async (listVectorTileS3Path) => {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3();

    const mbtileFileName = path.basename(listVectorTileS3Path);
    const s3ObjectKeyPath = path.join(MBTILE_S3_BUCKET_PATH, mbtileFileName);

    const params = {
      Bucket: MBTILE_S3_BUCKET_NAME,
      Key: s3ObjectKeyPath,
    };

    s3.deleteObject(params, (err, data) => {
      if (err) {
        const errorMessage = `Deleting MBTile from S3 bucket failed !!! ${JSON.stringify(err)}`;
        logger.error(errorMessage);
        reject(new Error(errorMessage));
      } else {
        logger.info(`Deleting old MBTile from S3 bucket - ${listVectorTileS3Path}`);
        resolve({ message: 'MBTile deleted from S3 bucket' });
      }
    });
  });
};

/**
 * @description - Get MBTile Vector Tiles from S3
 *
 * @param {string} listVectorTileS3Path - MBTile S3 file name
 * @return {Promise<unknown>} - Promise resolved with { oldMBTileS3FilePath }/rejected with error message
 */
exports.getMBTileFromS3Bucket = async (listVectorTileS3Path) => {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3();

    const mbtileFileName = path.basename(listVectorTileS3Path);
    const s3ObjectKeyPath = path.join(MBTILE_S3_BUCKET_PATH, mbtileFileName);

    const params = {
      Bucket: MBTILE_S3_BUCKET_NAME,
      Key: s3ObjectKeyPath,
    };

    s3.getObject(params, async (err, data) => {
      if (err) {
        const errorMessage = `Getting MBTile Vector Tiles from S3 bucket failed !!! ${JSON.stringify(
          err
        )}`;
        logger.error(errorMessage);
        reject(new Error(errorMessage));
      } else {
        logger.info(`Getting MBTile Vector Tiles from S3 bucket - ${listVectorTileS3Path}`);
        const mbtileFilePath = path.join(VECTOR_TILES_LOCATION, mbtileFileName);

        try {
          await writeFile(mbtileFilePath, data.Body);
          resolve({
            message: 'MBTile retrieved from S3 bucket',
            mbtileFilePath,
          });
        } catch (errorSaveFile) {
          const errorMessage = `Getting MBTile Vector Tiles from S3 bucket failed !!! ${JSON.stringify(
            errorSaveFile
          )}`;
          logger.error(errorMessage);
          reject(new Error(errorMessage));
        }
      }
    });
  });
};
