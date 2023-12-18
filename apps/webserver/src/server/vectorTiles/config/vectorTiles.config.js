const path = require('path');

const MBTILE_EXTENSION = '.mbtiles';
const MBTILE_S3_BUCKET_NAME = process.env.BUCKET || '';
const MBTILE_S3_BUCKET = path.join(MBTILE_S3_BUCKET_NAME, 'mbtiles', process.env.NODE_ENV);
const MBTILE_S3_BUCKET_PATH = path.join('mbtiles', process.env.NODE_ENV);
const VECTOR_TILES_LOCATION = path.join(__dirname, '../../../../', '/src/vectorTiles');
const VECTOR_TILES_TEMP_LOCATION = '/tmp';

export {
  MBTILE_EXTENSION,
  MBTILE_S3_BUCKET_NAME,
  MBTILE_S3_BUCKET,
  MBTILE_S3_BUCKET_PATH,
  VECTOR_TILES_LOCATION,
  VECTOR_TILES_TEMP_LOCATION,
};
