/**
 * @jest-environment node
 */

// const config = require('../../../config/publicutils/listManager.utils');

// Mock config FIRST to prevent logger initialization
jest.mock('../../../config/config', () => ({
  __esModule: true,
  default: {
    vectorTiles: {
      location: '/tmp/tiles',
      extension: '.mbtiles',
    },
  },
}));

jest.mock('../../../config/publicutils/listManager.utils', () => ({
  getListTypeId: jest.fn(() => 1),
}));

jest.mock('path', () => ({
  basename: jest.fn((p) => p.split('/').pop()),
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
}));

jest.mock('glob', () => ({
  sync: jest.fn(() => []),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  GetObjectCommand: jest.fn(),
  PutObjectCommand: jest.fn(),
  DeleteObjectsCommand: jest.fn(),
  ListObjectsV2Command: jest.fn(),
}));

jest.mock('node:fs/promises', () => ({
  writeFile: jest.fn(),
  readFile: jest.fn(),
}));

jest.mock('@mapbox/mbtiles', () => {
  return jest.fn().mockImplementation((path, callback) => {
    const mockMbtiles = {
      getInfo: jest.fn((cb) => {
        cb(null, {
          bounds: [-180, -85, 180, 85],
          maxzoom: 14,
          minzoom: 0,
          filesize: 1024,
        });
      }),
      getTile: jest.fn((z, x, y, cb) => {
        cb(null, Buffer.from('mock tile data'), {});
      }),
      close: jest.fn((cb) => cb && cb()),
    };
    callback && callback(null, mockMbtiles);
    return mockMbtiles;
  });
});

jest.mock('date-fns', () => ({
  format: jest.fn(() => '2024-01-01'),
}));

jest.mock('mssql', () => ({
  connect: jest.fn(),
  close: jest.fn(),
  Int: 'Int',
  VarChar: 'VarChar',
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  unlinkSync: jest.fn(),
  statSync: jest.fn(() => ({ size: 1024 })),
}));

jest.mock('../../../config/privateutils/sql.utils', () => ({
  executeOrganizationStoredProcedure: jest.fn(),
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../config/vectorTiles.config', () => ({
  VECTOR_TILES_LOCATION: '/tmp/tiles',
  MBTILE_EXTENSION: '.mbtiles',
}));

jest.mock('../utils/vectorTileGenerate.utils');
jest.mock('../utils/vectorTileRetrieve.utils');
jest.mock('../utils/vectorTileDB.utils');
jest.mock('../utils/vectorTileS3.utils');

const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTilesController = require('./vectorTiles.controller');
const { generateAndStoreVectorTiles } = require('../utils/vectorTileGenerate.utils');
const { getTileUsingZoomAndPosition } = require('../utils/vectorTileRetrieve.utils');
const { getListVectorTileS3PathDB } = require('../utils/vectorTileDB.utils');
const { getMBTileFromS3Bucket } = require('../utils/vectorTileS3.utils');
const sqlUtils = require('../../../config/privateutils/sql.utils');

describe('vectorTiles.controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {},
      user: { id: 'user123' },
      session: { organization_database: 'test_db' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('deleteTiles', () => {
    it('should delete vector tiles for a list', async () => {
      req.body = { listID: 123 };
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue({});

      await vectorTilesController.deleteTiles(req, res);

      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        req,
        'uspDeleteListVectorTilesPath',
        expect.any(Array)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.stringContaining('deleted'),
      });
    });

    it('should return 400 for invalid listID', async () => {
      req.body = { listID: 'invalid' };

      await vectorTilesController.deleteTiles(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('number'),
      });
    });

    it('should handle database errors', async () => {
      req.body = { listID: 123 };
      sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(new Error('DB error'));

      await vectorTilesController.deleteTiles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        error: 'DB error',
      });
    });
  });

  describe('generateTiles', () => {
    it('should initiate tile generation', async () => {
      req.body = { listID: 123 };
      generateAndStoreVectorTiles.mockResolvedValue({ message: 'Tiles generated' });

      await vectorTilesController.generateTiles(req, res);

      expect(generateAndStoreVectorTiles).toHaveBeenCalledWith(req, 123);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tiles generated',
      });
    });

    it('should handle generation errors', async () => {
      req.body = { listID: 123 };
      generateAndStoreVectorTiles.mockRejectedValue({ message: 'Generation failed' });

      await vectorTilesController.generateTiles(req, res);

      // Wait for promise rejection to be handled
      await new Promise(process.nextTick);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Generation failed',
      });
    });
  });

  describe('retrieveTiles', () => {
    it('should retrieve tiles with valid parameters', async () => {
      req.params = { id: '123' };
      req.query = { latitude: '40.7128', longitude: '-74.0060', zoom: '10' };
      const mockHeaders = { 'Content-Type': 'application/x-protobuf' };
      const mockData = Buffer.from('tile data');
      getTileUsingZoomAndPosition.mockResolvedValue([mockHeaders, mockData]);

      await vectorTilesController.retrieveTiles(req, res);

      expect(getTileUsingZoomAndPosition).toHaveBeenCalledWith(
        req,
        '123',
        '40.7128',
        '-74.0060',
        '10'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.header).toHaveBeenCalledWith(mockHeaders);
      expect(res.send).toHaveBeenCalledWith(mockData);
    });

    it('should return 400 when missing required parameters', async () => {
      req.params = { id: '123' };
      req.query = { latitude: '40.7128' };

      await vectorTilesController.retrieveTiles(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('latitude, longitude and zoom'),
      });
    });

    it('should handle tile retrieval errors', async () => {
      req.params = { id: '123' };
      req.query = { latitude: '40.7128', longitude: '-74.0060', zoom: '10' };
      getTileUsingZoomAndPosition.mockRejectedValue(new Error('Tile not found'));

      await vectorTilesController.retrieveTiles(req, res);

      // Wait for promise rejection to be handled
      await new Promise(process.nextTick);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tile not found',
      });
    });
  });

  describe('getListMbtileInfo', () => {
    it('should return mbtile file info', async () => {
      req.body = { listID: 123 };
      getListVectorTileS3PathDB.mockResolvedValue('path/to/file.mbtiles');
      getMBTileFromS3Bucket.mockResolvedValue();

      await vectorTilesController.getListMbtileInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          bounds: expect.any(Array),
          maxZoom: expect.any(Number),
          minZoom: expect.any(Number),
          success: expect.any(Number),
        })
      );
    });

    it('should handle errors when getting mbtile info', async () => {
      req.body = { listID: 123 };
      getListVectorTileS3PathDB.mockRejectedValue(new Error('DB error'));

      await vectorTilesController.getListMbtileInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Error'),
        error: 'DB error',
      });
    });
  });

  describe('prepareMbtileFile', () => {
    it('should return local file path when file exists', async () => {
      const fs = require('fs');
      fs.existsSync.mockReturnValue(true);
      getListVectorTileS3PathDB.mockResolvedValue('path/to/file.mbtiles');

      const result = await vectorTilesController.prepareMbtileFile(req, 123);

      expect(result).toContain('file.mbtiles');
      expect(getMBTileFromS3Bucket).not.toHaveBeenCalled();
    });

    it('should download from S3 when file does not exist locally', async () => {
      const fs = require('fs');
      fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);
      fs.statSync.mockReturnValue({ size: 1024 });
      getListVectorTileS3PathDB.mockResolvedValue('path/to/file.mbtiles');
      getMBTileFromS3Bucket.mockResolvedValue();

      const result = await vectorTilesController.prepareMbtileFile(req, 123);

      expect(getMBTileFromS3Bucket).toHaveBeenCalledWith('path/to/file.mbtiles');
      expect(result).toContain('file.mbtiles');
    });
  });
});
