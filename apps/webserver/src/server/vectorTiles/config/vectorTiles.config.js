const path = require('path');

exports.MBTILE_EXTENSION = '.mbtiles';
exports.MBTILE_S3_BUCKET = path.join(process.env.BUCKET, 'mbtiles', process.env.NODE_ENV);
exports.VECTOR_TILES_LOCATION = path.join(__dirname, '../../../../', '/src/vectorTiles');
exports.VECTOR_TILES_TEMP_LOCATION = '/tmp';
