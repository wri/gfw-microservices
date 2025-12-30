const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileS3Utils = require('./vectorTileS3.utils');
const AWS = require('aws-sdk');

jest.mock('aws-sdk');

describe('vectorTileS3.utils', () => {
  let mockS3;

  beforeEach(() => {
    mockS3 = {
      getObject: jest.fn(),
      putObject: jest.fn(),
      deleteObjects: jest.fn(),
      listObjectsV2: jest.fn(),
    };

    AWS.S3.mockImplementation(() => mockS3);
    jest.clearAllMocks();
  });

  describe('getTileFromS3', () => {
    it('should retrieve tile from S3 bucket', async () => {
      const mockData = Buffer.from('tile data');
      mockS3.getObject.mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Body: mockData }),
      });

      const result = await vectorTileS3Utils.getTileFromS3('tiles/list123/10/512/384.pbf');

      expect(result).toEqual(mockData);
      expect(mockS3.getObject).toHaveBeenCalledWith({
        Bucket: expect.any(String),
        Key: 'tiles/list123/10/512/384.pbf',
      });
    });

    it('should return null when tile not found', async () => {
      mockS3.getObject.mockReturnValue({
        promise: jest.fn().mockRejectedValue({ code: 'NoSuchKey' }),
      });

      const result = await vectorTileS3Utils.getTileFromS3('tiles/nonexistent.pbf');

      expect(result).toBeNull();
    });

    it('should throw error for non-404 S3 errors', async () => {
      mockS3.getObject.mockReturnValue({
        promise: jest.fn().mockRejectedValue({ code: 'AccessDenied' }),
      });

      await expect(
        vectorTileS3Utils.getTileFromS3('tiles/list123/tile.pbf')
      ).rejects.toHaveProperty('code', 'AccessDenied');
    });
  });

  describe('uploadTiles', () => {
    it('should upload multiple tiles to S3', async () => {
      const tiles = [
        { path: 'tiles/1.pbf', data: Buffer.from('tile1') },
        { path: 'tiles/2.pbf', data: Buffer.from('tile2') },
      ];

      mockS3.putObject.mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      });

      const result = await vectorTileS3Utils.uploadTiles(tiles);

      expect(result).toEqual({ uploaded: 2 });
      expect(mockS3.putObject).toHaveBeenCalledTimes(2);
    });

    it('should handle upload failures', async () => {
      const tiles = [{ path: 'tiles/1.pbf', data: Buffer.from('tile1') }];

      mockS3.putObject.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Upload failed')),
      });

      await expect(vectorTileS3Utils.uploadTiles(tiles)).rejects.toThrow('Upload failed');
    });

    it('should set correct content type for tiles', async () => {
      const tiles = [{ path: 'tiles/1.pbf', data: Buffer.from('tile1') }];

      mockS3.putObject.mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      });

      await vectorTileS3Utils.uploadTiles(tiles);

      expect(mockS3.putObject).toHaveBeenCalledWith(
        expect.objectContaining({
          ContentType: 'application/x-protobuf',
        })
      );
    });
  });

  describe('deleteTilesForList', () => {
    it('should delete all tiles for a list', async () => {
      mockS3.listObjectsV2.mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          Contents: [
            { Key: 'tiles/list123/10/1/1.pbf' },
            { Key: 'tiles/list123/10/1/2.pbf' },
          ],
        }),
      });

      mockS3.deleteObjects.mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Deleted: [{ Key: 'tiles/list123/10/1/1.pbf' }] }),
      });

      const result = await vectorTileS3Utils.deleteTilesForList('list123');

      expect(result).toHaveProperty('deleted');
      expect(mockS3.listObjectsV2).toHaveBeenCalled();
      expect(mockS3.deleteObjects).toHaveBeenCalled();
    });

    it('should handle empty list gracefully', async () => {
      mockS3.listObjectsV2.mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Contents: [] }),
      });

      const result = await vectorTileS3Utils.deleteTilesForList('list999');

      expect(result).toEqual({ deleted: 0 });
      expect(mockS3.deleteObjects).not.toHaveBeenCalled();
    });
  });
});