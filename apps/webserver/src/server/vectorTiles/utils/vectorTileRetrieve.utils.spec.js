/**
 * @jest-environment node
 */

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  basename: jest.fn((p) => p.split('/').pop()),
}));

jest.mock('@mapbox/mbtiles', () => {
  return jest.fn().mockImplementation((path, callback) => {
    const mockMbtiles = {
      getTile: jest.fn((z, x, y, cb) => {
        cb(null, Buffer.from('mock tile data'), { 'Content-Type': 'application/x-protobuf' });
      }),
    };
    callback && callback(null, mockMbtiles);
    return mockMbtiles;
  });
});

jest.mock('./vectorTileDB.utils', () => ({
  getListVectorTileS3PathDB: jest.fn(),
}));

jest.mock('./vectorTileS3.utils', () => ({
  getMBTileFromS3Bucket: jest.fn(),
}));

jest.mock('./vectorTileGenerate.utils', () => ({
  generateAndStoreVectorTiles: jest.fn(),
}));

jest.mock('../config/vectorTiles.config', () => ({
  VECTOR_TILES_LOCATION: '/var/tiles',
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileRetrieveUtils = require('./vectorTileRetrieve.utils');
const { getListVectorTileS3PathDB } = require('./vectorTileDB.utils');
const { getMBTileFromS3Bucket } = require('./vectorTileS3.utils');
const { generateAndStoreVectorTiles } = require('./vectorTileGenerate.utils');
const MBTiles = require('@mapbox/mbtiles');
const fs = require('fs');

describe('vectorTileRetrieve.utils', () => {
  let req;

  beforeEach(() => {
    req = {
      session: { organization_database: 'test_db' },
    };
    jest.clearAllMocks();
  });

  describe('getTileUsingZoomAndPosition', () => {
    it('should retrieve tile using latitude, longitude, and zoom', async () => {
      const mockTileData = Buffer.from('tile data');
      const mockHeaders = { 'Content-Type': 'application/x-protobuf' };

      getListVectorTileS3PathDB.mockResolvedValue('s3://bucket/list-123.mbtiles');
      fs.existsSync.mockReturnValue(true);

      const mockMbtiles = {
        getTile: jest.fn((z, x, y, cb) => {
          cb(null, mockTileData, mockHeaders);
        }),
      };

      MBTiles.mockImplementation((path, callback) => {
        callback(null, mockMbtiles);
        return mockMbtiles;
      });

      const result = await vectorTileRetrieveUtils.getTileUsingZoomAndPosition(
        req,
        123,
        40.7128, // latitude (New York)
        -74.006, // longitude
        10 // zoom
      );

      expect(result).toEqual([mockHeaders, mockTileData]);
      expect(getListVectorTileS3PathDB).toHaveBeenCalledWith(req, 123);
      expect(mockMbtiles.getTile).toHaveBeenCalledWith(
        10,
        expect.any(Number),
        expect.any(Number),
        expect.any(Function)
      );
    });

    it('should generate tiles when path not in database', async () => {
      const mockTileData = Buffer.from('tile data');

      getListVectorTileS3PathDB.mockResolvedValue(null);
      generateAndStoreVectorTiles.mockResolvedValue({
        path: 's3://bucket/new-list-123.mbtiles',
      });
      fs.existsSync.mockReturnValue(true);

      const mockMbtiles = {
        getTile: jest.fn((z, x, y, cb) => {
          cb(null, mockTileData, {});
        }),
      };

      MBTiles.mockImplementation((path, callback) => {
        callback(null, mockMbtiles);
        return mockMbtiles;
      });

      const result = await vectorTileRetrieveUtils.getTileUsingZoomAndPosition(req, 123, 0, 0, 5);

      expect(generateAndStoreVectorTiles).toHaveBeenCalledWith(req, 123);
      expect(result).toBeDefined();
    });

    it('should download from S3 when file not found locally', async () => {
      const mockTileData = Buffer.from('tile data');

      getListVectorTileS3PathDB.mockResolvedValue('s3://bucket/list-123.mbtiles');
      fs.existsSync.mockReturnValue(false);
      getMBTileFromS3Bucket.mockResolvedValue();

      const mockMbtiles = {
        getTile: jest.fn((z, x, y, cb) => {
          cb(null, mockTileData, {});
        }),
      };

      MBTiles.mockImplementation((path, callback) => {
        callback(null, mockMbtiles);
        return mockMbtiles;
      });

      await vectorTileRetrieveUtils.getTileUsingZoomAndPosition(req, 123, 0, 0, 5);

      expect(getMBTileFromS3Bucket).toHaveBeenCalledWith('s3://bucket/list-123.mbtiles');
    });

    it('should convert longitude to tile X coordinate correctly', async () => {
      const mockTileData = Buffer.from('tile data');

      getListVectorTileS3PathDB.mockResolvedValue('s3://bucket/list-123.mbtiles');
      fs.existsSync.mockReturnValue(true);

      const mockMbtiles = {
        getTile: jest.fn((z, x, y, cb) => {
          cb(null, mockTileData, {});
        }),
      };

      MBTiles.mockImplementation((path, callback) => {
        callback(null, mockMbtiles);
        return mockMbtiles;
      });

      await vectorTileRetrieveUtils.getTileUsingZoomAndPosition(req, 123, 0, 0, 10);

      // At zoom 10, longitude 0 should map to x = 512
      expect(mockMbtiles.getTile).toHaveBeenCalledWith(
        10,
        512,
        expect.any(Number),
        expect.any(Function)
      );
    });

    it('should convert latitude to tile Y coordinate correctly', async () => {
      const mockTileData = Buffer.from('tile data');

      getListVectorTileS3PathDB.mockResolvedValue('s3://bucket/list-123.mbtiles');
      fs.existsSync.mockReturnValue(true);

      const mockMbtiles = {
        getTile: jest.fn((z, x, y, cb) => {
          cb(null, mockTileData, {});
        }),
      };

      MBTiles.mockImplementation((path, callback) => {
        callback(null, mockMbtiles);
        return mockMbtiles;
      });

      await vectorTileRetrieveUtils.getTileUsingZoomAndPosition(req, 123, 0, 0, 10);

      // At zoom 10, latitude 0 should map to y = 512
      expect(mockMbtiles.getTile).toHaveBeenCalledWith(
        10,
        expect.any(Number),
        512,
        expect.any(Function)
      );
    });

    it('should handle mbtiles getTile errors', async () => {
      getListVectorTileS3PathDB.mockResolvedValue('s3://bucket/list-123.mbtiles');
      fs.existsSync.mockReturnValue(true);

      const mockMbtiles = {
        getTile: jest.fn((z, x, y, cb) => {
          cb(new Error('Tile not found'));
        }),
      };

      MBTiles.mockImplementation((path, callback) => {
        callback(null, mockMbtiles);
        return mockMbtiles;
      });

      const result = await vectorTileRetrieveUtils.getTileUsingZoomAndPosition(req, 123, 0, 0, 10);

      expect(result).toEqual([undefined, undefined]);
    });
  });
});
