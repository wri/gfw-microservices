/**
 * @jest-environment node
 */

jest.mock('fs', () => ({
  copyFile: jest.fn((oldPath, newPath, callback) => callback(null)),
  rmSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-1234-5678'),
}));

jest.mock('./vectorTileGeojson.utils', () => ({
  createTempGeojsonFiles: jest.fn(),
}));

jest.mock('./vectorTileTippecanoe.utils', () => ({
  createTippecanoeMBTiles: jest.fn(),
}));

jest.mock('./vectorTileDB.utils', () => ({
  getListVectorTileS3PathDB: jest.fn(),
  updateListVectorTilesStoragePathDB: jest.fn(),
}));

jest.mock('./vectorTileS3.utils', () => ({
  uploadMBTileToS3Bucket: jest.fn(),
  deletingMBTileFromS3Bucket: jest.fn(),
}));

jest.mock('../config/vectorTiles.config', () => ({
  VECTOR_TILES_TEMP_LOCATION: '/tmp/tiles',
  VECTOR_TILES_LOCATION: '/var/tiles',
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../../../config/publicutils/listManager.utils', () => ({
  getAllLists: jest.fn(),
  getUserLists: jest.fn(),
}));

const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileGenerateUtils = require('./vectorTileGenerate.utils');
const { createTempGeojsonFiles } = require('./vectorTileGeojson.utils');
const { createTippecanoeMBTiles } = require('./vectorTileTippecanoe.utils');
const {
  getListVectorTileS3PathDB,
  updateListVectorTilesStoragePathDB,
} = require('./vectorTileDB.utils');
const { uploadMBTileToS3Bucket, deletingMBTileFromS3Bucket } = require('./vectorTileS3.utils');
const ListManager = require('../../../config/publicutils/listManager.utils');
const fs = require('fs');

describe('vectorTileGenerate.utils', () => {
  let req;

  beforeEach(() => {
    req = {
      session: {
        organization_database: 'test_db',
        isNodeServer: false,
      },
    };
    jest.clearAllMocks();
  });

  describe('generateAndStoreVectorTiles', () => {
    it('should complete full tile generation pipeline', async () => {
      const mockLists = [
        {
          id: 123,
          list_locations_count: 100,
          vector_tiles_last_updated: null,
        },
      ];

      ListManager.getUserLists.mockResolvedValue(mockLists);
      createTempGeojsonFiles.mockResolvedValue();
      createTippecanoeMBTiles.mockResolvedValue({
        mbtileFileName: 'list-123.mbtiles',
        mbtileOutputFilePath: '/tmp/tiles/list-123/list-123.mbtiles',
      });
      getListVectorTileS3PathDB.mockResolvedValue(null);
      uploadMBTileToS3Bucket.mockResolvedValue({
        mbtileS3FilePath: 's3://bucket/list-123.mbtiles',
      });
      updateListVectorTilesStoragePathDB.mockResolvedValue();

      const result = await vectorTileGenerateUtils.generateAndStoreVectorTiles(req, 123);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('path', 's3://bucket/list-123.mbtiles');
      expect(createTempGeojsonFiles).toHaveBeenCalledWith(
        req,
        100,
        'mock_uuid_1234_5678',
        '/tmp/tiles/list-123',
        123
      );
      expect(createTippecanoeMBTiles).toHaveBeenCalled();
      expect(uploadMBTileToS3Bucket).toHaveBeenCalledWith(
        'list-123.mbtiles',
        '/tmp/tiles/list-123/list-123.mbtiles'
      );
      expect(updateListVectorTilesStoragePathDB).toHaveBeenCalledWith(
        req,
        123,
        's3://bucket/list-123.mbtiles'
      );
    });

    it('should skip generation if recently updated', async () => {
      const recentDate = new Date();
      const mockLists = [
        {
          id: 123,
          list_locations_count: 100,
          vector_tiles_last_updated: recentDate,
        },
      ];

      req.session.isNodeServer = true;
      req.messageTimestamp = new Date(recentDate.getTime() + 2 * 60 * 1000).toISOString(); // 2 minutes later

      ListManager.getAllLists.mockResolvedValue(mockLists);

      const result = await vectorTileGenerateUtils.generateAndStoreVectorTiles(req, 123);

      expect(result).toHaveProperty('message', expect.stringContaining('already generated'));
      expect(result).toHaveProperty('lastUpdatedTime', recentDate);
      expect(createTempGeojsonFiles).not.toHaveBeenCalled();
    });

    it('should delete old tiles when updating', async () => {
      const mockLists = [
        {
          id: 123,
          list_locations_count: 50,
          vector_tiles_last_updated: null,
        },
      ];

      ListManager.getUserLists.mockResolvedValue(mockLists);
      createTempGeojsonFiles.mockResolvedValue();
      createTippecanoeMBTiles.mockResolvedValue({
        mbtileFileName: 'list-123-new.mbtiles',
        mbtileOutputFilePath: '/tmp/tiles/list-123/list-123-new.mbtiles',
      });
      getListVectorTileS3PathDB.mockResolvedValue('s3://bucket/old-list-123.mbtiles');
      uploadMBTileToS3Bucket.mockResolvedValue({
        mbtileS3FilePath: 's3://bucket/list-123-new.mbtiles',
      });
      updateListVectorTilesStoragePathDB.mockResolvedValue();
      deletingMBTileFromS3Bucket.mockResolvedValue();

      await vectorTileGenerateUtils.generateAndStoreVectorTiles(req, 123);

      expect(deletingMBTileFromS3Bucket).toHaveBeenCalledWith('s3://bucket/old-list-123.mbtiles');
    });

    it('should copy mbtile to permanent location', async () => {
      const mockLists = [
        {
          id: 123,
          list_locations_count: 10,
          vector_tiles_last_updated: null,
        },
      ];

      ListManager.getUserLists.mockResolvedValue(mockLists);
      createTempGeojsonFiles.mockResolvedValue();
      createTippecanoeMBTiles.mockResolvedValue({
        mbtileFileName: 'list-123.mbtiles',
        mbtileOutputFilePath: '/tmp/tiles/list-123/list-123.mbtiles',
      });
      getListVectorTileS3PathDB.mockResolvedValue(null);
      uploadMBTileToS3Bucket.mockResolvedValue({
        mbtileS3FilePath: 's3://bucket/list-123.mbtiles',
      });
      updateListVectorTilesStoragePathDB.mockResolvedValue();

      await vectorTileGenerateUtils.generateAndStoreVectorTiles(req, 123);

      expect(fs.copyFile).toHaveBeenCalledWith(
        '/tmp/tiles/list-123/list-123.mbtiles',
        '/var/tiles/list-123.mbtiles',
        expect.any(Function)
      );
    });

    it('should throw error when mbtile generation fails', async () => {
      const mockLists = [
        {
          id: 123,
          list_locations_count: 100,
          vector_tiles_last_updated: null,
        },
      ];

      ListManager.getUserLists.mockResolvedValue(mockLists);
      createTempGeojsonFiles.mockResolvedValue();
      createTippecanoeMBTiles.mockResolvedValue({
        mbtileFileName: null,
        mbtileOutputFilePath: null,
      });

      await expect(vectorTileGenerateUtils.generateAndStoreVectorTiles(req, 123)).rejects.toThrow(
        'Generating Vector Tiles failed'
      );
    });

    it('should handle file copy errors gracefully', async () => {
      const mockLists = [
        {
          id: 123,
          list_locations_count: 10,
          vector_tiles_last_updated: null,
        },
      ];

      ListManager.getUserLists.mockResolvedValue(mockLists);
      createTempGeojsonFiles.mockResolvedValue();
      createTippecanoeMBTiles.mockResolvedValue({
        mbtileFileName: 'list-123.mbtiles',
        mbtileOutputFilePath: '/tmp/tiles/list-123/list-123.mbtiles',
      });
      getListVectorTileS3PathDB.mockResolvedValue(null);
      uploadMBTileToS3Bucket.mockResolvedValue({
        mbtileS3FilePath: 's3://bucket/list-123.mbtiles',
      });
      updateListVectorTilesStoragePathDB.mockResolvedValue();
      fs.copyFile.mockImplementation((oldPath, newPath, callback) => {
        callback(new Error('Copy failed'));
      });

      const result = await vectorTileGenerateUtils.generateAndStoreVectorTiles(req, 123);

      expect(result).toHaveProperty('path', 's3://bucket/list-123.mbtiles');
      expect(fs.rmSync).not.toHaveBeenCalled();
    });
  });
});
