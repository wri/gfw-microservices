const path = require('path');

const MBTILE_S3_BUCKET_NAME = process.env.BUCKET || '';

exports.MBTILE_EXTENSION = '.mbtiles';
exports.MBTILE_S3_BUCKET_NAME = MBTILE_S3_BUCKET_NAME;
exports.MBTILE_S3_BUCKET_PATH = path.join('mbtiles', process.env.NODE_ENV);
exports.MBTILE_S3_BUCKET = path.join(MBTILE_S3_BUCKET_NAME, 'mbtiles', process.env.NODE_ENV);
exports.VECTOR_TILES_LOCATION = path.join(__dirname, '../../../../', '/src/vectorTiles');
exports.VECTOR_TILES_TEMP_LOCATION = '/tmp';
