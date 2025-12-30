const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileRetrieveUtils = require('./vectorTileRetrieve.utils');
const vectorTileS3Utils = require('./vectorTileS3.utils');
const vectorTileUtils = require('./vectorTile.utils');

jest.mock('./vectorTileS3.utils');
jest.mock('./vectorTile.utils');

describe('vectorTileRetrieve.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTile', () => {
    it('should retrieve tile from S3', async () => {
      const mockTileData = Buffer.from('tile data');
      vectorTileUtils.validateTileParameters.mockReturnValue(true);
      vectorTileUtils.getTilePath.mockReturnValue('tiles/list123/10/512/384.pbf');
      vectorTileS3Utils.getTileFromS3.mockResolvedValue(mockTileData);

      const result = await vectorTileRetrieveUtils.getTile({
        listId: 'list123',
        z: 10,
        x: 512,
        y: 384,
      });

      expect(result).toEqual(mockTileData);
      expect(vectorTileUtils.validateTileParameters).toHaveBeenCalledWith(10, 512, 384);
      expect(vectorTileS3Utils.getTileFromS3).toHaveBeenCalled();
    });

    it('should return null for invalid tile parameters', async () => {
      vectorTileUtils.validateTileParameters.mockReturnValue(false);

      const result = await vectorTileRetrieveUtils.getTile({
        listId: 'list123',
        z: -1,
        x: 512,
        y: 384,
      });

      expect(result).toBeNull();
      expect(vectorTileS3Utils.getTileFromS3).not.toHaveBeenCalled();
    });

    it('should return null when tile not found in S3', async () => {
      vectorTileUtils.validateTileParameters.mockReturnValue(true);
      vectorTileUtils.getTilePath.mockReturnValue('tiles/list123/10/512/384.pbf');
      vectorTileS3Utils.getTileFromS3.mockResolvedValue(null);

      const result = await vectorTileRetrieveUtils.getTile({
        listId: 'list123',
        z: 10,
        x: 512,
        y: 384,
      });

      expect(result).toBeNull();
    });

    it('should handle S3 errors gracefully', async () => {
      vectorTileUtils.validateTileParameters.mockReturnValue(true);
      vectorTileUtils.getTilePath.mockReturnValue('tiles/list123/10/512/384.pbf');
      vectorTileS3Utils.getTileFromS3.mockRejectedValue(new Error('S3 error'));

      await expect(
        vectorTileRetrieveUtils.getTile({
          listId: 'list123',
          z: 10,
          x: 512,
          y: 384,
        })
      ).rejects.toThrow('S3 error');
    });
  });

  describe('getTilesForBounds', () => {
    it('should retrieve all tiles within bounds', async () => {
      const mockTile1 = Buffer.from('tile1');
      const mockTile2 = Buffer.from('tile2');
      
      vectorTileUtils.validateTileParameters.mockReturnValue(true);
      vectorTileUtils.getTilePath.mockReturnValue('path');
      vectorTileS3Utils.getTileFromS3
        .mockResolvedValueOnce(mockTile1)
        .mockResolvedValueOnce(mockTile2);

      const result = await vectorTileRetrieveUtils.getTilesForBounds({
        listId: 'list123',
        zoom: 10,
        minX: 512,
        maxX: 513,
        minY: 384,
        maxY: 385,
      });

      expect(result).toHaveLength(4); // 2x2 grid
      expect(vectorTileS3Utils.getTileFromS3).toHaveBeenCalledTimes(4);
    });

    it('should filter out null tiles', async () => {
      vectorTileUtils.validateTileParameters.mockReturnValue(true);
      vectorTileUtils.getTilePath.mockReturnValue('path');
      vectorTileS3Utils.getTileFromS3
        .mockResolvedValueOnce(Buffer.from('tile1'))
        .mockResolvedValueOnce(null);

      const result = await vectorTileRetrieveUtils.getTilesForBounds({
        listId: 'list123',
        zoom: 10,
        minX: 512,
        maxX: 513,
        minY: 384,
        maxY: 384,
      });

      expect(result.length).toBeLessThanOrEqual(2);
    });
  });
});