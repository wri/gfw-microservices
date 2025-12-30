/**
 * @jest-environment node
 */

// Mock @mapbox/mbtiles BEFORE any imports
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

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

jest.mock('../templates/esri-vector-tile-root', () => ({
  esriVectorTileRoot: { version: 8, sources: {} },
}));

jest.mock('../templates/esri-vector-tile-metadata', () => ({
  esriVectorTileMetadata: { name: 'test', format: 'pbf' },
}));

jest.mock('../config/vectorTiles.config', () => ({
  VECTOR_TILES_LOCATION: '/tmp/tiles',
  MBTILE_EXTENSION: '.mbtiles',
}));

jest.mock('../controllers/vectorTiles.controller', () => ({
  prepareMbtileFile: jest.fn(),
}));

const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const arcgisController = require('./arcgis.controller');
const vectorTilesController = require('../controllers/vectorTiles.controller');
const MBTiles = require('@mapbox/mbtiles');
const fs = require('fs');

describe('arcgis.controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      writeHead: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getEsriVectorTileRoot', () => {
    it('should return vector tile root JSON', () => {
      arcgisController.getEsriVectorTileRoot(req, res);

      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ version: 8, sources: {} }));
    });
  });

  describe('getEsriVectorTileMetadata', () => {
    it('should return vector tile metadata JSON', () => {
      arcgisController.getEsriVectorTileMetadata(req, res);

      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test', format: 'pbf' })
      );
    });
  });

  describe('handleVectorTilePbfRequest', () => {
    it('should return vector tile binary data', async () => {
      const mockTileData = Buffer.from('tile data');
      const mockMbtiles = {
        getTile: jest.fn((z, x, y, cb) => {
          cb(null, mockTileData, { 'Content-Type': 'application/x-protobuf' });
        }),
      };

      MBTiles.mockImplementation((path, callback) => {
        callback(null, mockMbtiles);
        return mockMbtiles;
      });

      req.params = { mbtile: 'test-list', z: '10', x: '512', y: '384' };

      await arcgisController.handleVectorTilePbfRequest(req, res);

      expect(fs.existsSync).toHaveBeenCalled();
      expect(mockMbtiles.getTile).toHaveBeenCalledWith('10', '512', '384', expect.any(Function));
      expect(res.writeHead).toHaveBeenCalledWith(
        200,
        expect.objectContaining({
          'Cache-Control': expect.any(String),
        })
      );
      expect(res.end).toHaveBeenCalledWith(mockTileData);
    });

    it('should prepare mbtile file when not found locally', async () => {
      const mockTileData = Buffer.from('tile data');
      const mockMbtiles = {
        getTile: jest.fn((z, x, y, cb) => {
          cb(null, mockTileData, {});
        }),
      };

      fs.existsSync.mockReturnValueOnce(false);
      vectorTilesController.prepareMbtileFile.mockResolvedValue();
      MBTiles.mockImplementation((path, callback) => {
        callback(null, mockMbtiles);
        return mockMbtiles;
      });

      req.params = { mbtile: 'test-list', z: '10', x: '512', y: '384' };

      await arcgisController.handleVectorTilePbfRequest(req, res);

      expect(vectorTilesController.prepareMbtileFile).toHaveBeenCalledWith(
        req,
        null,
        'test-list.mbtiles'
      );
      expect(res.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
    });

    it('should return 422 when tile not found', async () => {
      const mockMbtiles = {
        getTile: jest.fn((z, x, y, cb) => {
          cb(new Error('Tile not found'));
        }),
      };

      MBTiles.mockImplementation((path, callback) => {
        callback(null, mockMbtiles);
        return mockMbtiles;
      });

      req.params = { mbtile: 'test-list', z: '10', x: '512', y: '384' };

      await arcgisController.handleVectorTilePbfRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      MBTiles.mockImplementation(() => {
        throw new Error('MBTiles error');
      });

      req.params = { mbtile: 'test-list', z: '10', x: '512', y: '384' };

      await arcgisController.handleVectorTilePbfRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
