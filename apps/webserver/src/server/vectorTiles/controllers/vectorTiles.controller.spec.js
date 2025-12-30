const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTilesController = require('./vectorTiles.controller');
const vectorTileGenerateUtils = require('../utils/vectorTileGenerate.utils');
const vectorTileSQSUtils = require('../utils/vectorTileSQS.utils');

jest.mock('../utils/vectorTileGenerate.utils');
jest.mock('../utils/vectorTileSQS.utils');

describe('vectorTiles.controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: 'user123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('generateVectorTiles', () => {
    it('should initiate vector tile generation', async () => {
      vectorTileSQSUtils.sendGenerateMessage.mockResolvedValue({ MessageId: 'msg123' });

      req.params = { listId: '123' };

      await vectorTilesController.generateVectorTiles(req, res);

      expect(vectorTileSQSUtils.sendGenerateMessage).toHaveBeenCalledWith({
        listId: '123',
        userId: 'user123',
      });
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('initiated'),
        listId: '123',
      });
    });

    it('should handle missing listId', async () => {
      await vectorTilesController.generateVectorTiles(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle SQS errors', async () => {
      vectorTileSQSUtils.sendGenerateMessage.mockRejectedValue(new Error('SQS error'));

      req.params = { listId: '123' };

      await vectorTilesController.generateVectorTiles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('SQS error') });
    });
  });

  describe('getVectorTileStatus', () => {
    it('should return generation status', async () => {
      vectorTileGenerateUtils.getGenerationStatus.mockResolvedValue({
        status: 'completed',
        progress: 100,
      });

      req.params = { listId: '456' };

      await vectorTilesController.getVectorTileStatus(req, res);

      expect(vectorTileGenerateUtils.getGenerationStatus).toHaveBeenCalledWith('456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'completed',
        progress: 100,
      });
    });

    it('should return 404 when status not found', async () => {
      vectorTileGenerateUtils.getGenerationStatus.mockResolvedValue(null);

      req.params = { listId: '456' };

      await vectorTilesController.getVectorTileStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteVectorTiles', () => {
    it('should delete vector tiles for a list', async () => {
      vectorTileGenerateUtils.deleteVectorTiles.mockResolvedValue({ deleted: 150 });

      req.params = { listId: '789' };

      await vectorTilesController.deleteVectorTiles(req, res);

      expect(vectorTileGenerateUtils.deleteVectorTiles).toHaveBeenCalledWith('789');
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('deleted'),
        deleted: 150,
      });
    });

    it('should handle deletion errors', async () => {
      vectorTileGenerateUtils.deleteVectorTiles.mockRejectedValue(new Error('Delete failed'));

      req.params = { listId: '789' };

      await vectorTilesController.deleteVectorTiles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});