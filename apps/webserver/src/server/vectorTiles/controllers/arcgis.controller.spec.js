const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const arcgisController = require('./arcgis.controller');
const vectorTileRetrieveUtils = require('../utils/vectorTileRetrieve.utils');
const esriVectorTileRoot = require('../templates/esri-vector-tile-root');
const esriVectorTileMetadata = require('../templates/esri-vector-tile-metadata');

jest.mock('../utils/vectorTileRetrieve.utils');
jest.mock('../templates/esri-vector-tile-root');
jest.mock('../templates/esri-vector-tile-metadata');

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
    };
    jest.clearAllMocks();
  });

  describe('getVectorTileRoot', () => {
    it('should return vector tile root JSON', async () => {
      const mockRoot = { version: 8, sources: {} };
      esriVectorTileRoot.mockReturnValue(mockRoot);

      req.params = { listId: '123' };

      await arcgisController.getVectorTileRoot(req, res);

      expect(res.json).toHaveBeenCalledWith(mockRoot);
      expect(esriVectorTileRoot).toHaveBeenCalledWith('123');
    });

    it('should handle missing listId parameter', async () => {
      await arcgisController.getVectorTileRoot(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should handle errors gracefully', async () => {
      req.params = { listId: '123' };
      esriVectorTileRoot.mockImplementation(() => {
        throw new Error('Template error');
      });

      await arcgisController.getVectorTileRoot(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Template error') });
    });
  });

  describe('getVectorTileMetadata', () => {
    it('should return vector tile metadata JSON', async () => {
      const mockMetadata = { name: 'test', format: 'pbf' };
      esriVectorTileMetadata.mockReturnValue(mockMetadata);

      req.params = { listId: '456' };

      await arcgisController.getVectorTileMetadata(req, res);

      expect(res.json).toHaveBeenCalledWith(mockMetadata);
      expect(esriVectorTileMetadata).toHaveBeenCalledWith('456');
    });

    it('should handle missing listId parameter', async () => {
      await arcgisController.getVectorTileMetadata(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getVectorTile', () => {
    it('should return vector tile binary data', async () => {
      const mockTileData = Buffer.from('tile data');
      vectorTileRetrieveUtils.getTile.mockResolvedValue(mockTileData);

      req.params = { listId: '123', z: '10', x: '512', y: '384' };

      await arcgisController.getVectorTile(req, res);

      expect(vectorTileRetrieveUtils.getTile).toHaveBeenCalledWith({
        listId: '123',
        z: 10,
        x: 512,
        y: 384,
      });
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/x-protobuf');
      expect(res.send).toHaveBeenCalledWith(mockTileData);
    });

    it('should return 404 when tile not found', async () => {
      vectorTileRetrieveUtils.getTile.mockResolvedValue(null);

      req.params = { listId: '123', z: '10', x: '512', y: '384' };

      await arcgisController.getVectorTile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Tile not found' });
    });

    it('should validate z/x/y parameters are numeric', async () => {
      req.params = { listId: '123', z: 'abc', x: '512', y: '384' };

      await arcgisController.getVectorTile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Invalid') });
    });

    it('should handle retrieval errors', async () => {
      vectorTileRetrieveUtils.getTile.mockRejectedValue(new Error('S3 error'));

      req.params = { listId: '123', z: '10', x: '512', y: '384' };

      await arcgisController.getVectorTile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
