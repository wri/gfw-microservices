/**
 * @jest-environment node
 */

jest.mock('fs', () => ({
  readdirSync: jest.fn(),
}));

jest.mock('tippecanoe', () => ({
  tippecanoeAsync: jest.fn(),
}));

jest.mock('./vectorTile.utils', () => ({
  getCurrentDateTimeFormatted: jest.fn(() => '20260102_120000'),
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../config/vectorTiles.config', () => ({
  MBTILE_EXTENSION: '.mbtiles',
}));

const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileTippecanoeUtils = require('./vectorTileTippecanoe.utils');
const fs = require('fs');
const { tippecanoeAsync } = require('tippecanoe');
const logger = require('../../../config/privateutils/logger.utils');

describe('vectorTileTippecanoe.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTippecanoeMBTiles', () => {
    it('should generate mbtiles using tippecanoe', async () => {
      fs.readdirSync.mockReturnValue([
        'test_uuid.geojson',
        'test_uuid_chunk1.geojson',
        'other_file.txt',
      ]);

      tippecanoeAsync.mockResolvedValue();

      const result = await vectorTileTippecanoeUtils.createTippecanoeMBTiles({
        listID: 123,
        numberOfLocations: 50,
        tempFilesPath: '/tmp/list-123',
        uuidString: 'test_uuid',
      });

      expect(fs.readdirSync).toHaveBeenCalledWith('/tmp/list-123');
      expect(tippecanoeAsync).toHaveBeenCalledWith(
        ['/tmp/list-123/test_uuid.geojson', '/tmp/list-123/test_uuid_chunk1.geojson'],
        expect.objectContaining({
          layer: '20260102_120000_50_123_test_uuid',
          output: '/tmp/list-123/20260102_120000_50_123_test_uuid.mbtiles',
          readParallel: true,
          noTileSizeLimit: true,
        }),
        { echo: true }
      );
      expect(result).toEqual({
        mbtileOutputFilePath: '/tmp/list-123/20260102_120000_50_123_test_uuid.mbtiles',
        mbtileFileName: '20260102_120000_50_123_test_uuid.mbtiles',
      });
      expect(logger.info).toHaveBeenCalledWith(
        'Vector Tiles created: /tmp/list-123/20260102_120000_50_123_test_uuid.mbtiles'
      );
    });

    it('should filter geojson files by uuid', async () => {
      fs.readdirSync.mockReturnValue(['uuid1.geojson', 'uuid2.geojson', 'uuid1_chunk.geojson']);

      tippecanoeAsync.mockResolvedValue();

      await vectorTileTippecanoeUtils.createTippecanoeMBTiles({
        listID: 456,
        numberOfLocations: 25,
        tempFilesPath: '/tmp/list-456',
        uuidString: 'uuid1',
      });

      const geojsonFiles = tippecanoeAsync.mock.calls[0][0];
      expect(geojsonFiles).toHaveLength(2);
      expect(geojsonFiles).toContain('/tmp/list-456/uuid1.geojson');
      expect(geojsonFiles).toContain('/tmp/list-456/uuid1_chunk.geojson');
      expect(geojsonFiles).not.toContain('/tmp/list-456/uuid2.geojson');
    });

    it('should handle tippecanoe errors', async () => {
      fs.readdirSync.mockReturnValue(['test_uuid.geojson']);
      tippecanoeAsync.mockRejectedValue(new Error('Tippecanoe execution failed'));

      await expect(
        vectorTileTippecanoeUtils.createTippecanoeMBTiles({
          listID: 789,
          numberOfLocations: 10,
          tempFilesPath: '/tmp/list-789',
          uuidString: 'test_uuid',
        })
      ).rejects.toThrow('Generating Vector Tiles failed');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Generating Vector Tiles failed')
      );
    });

    it('should use correct file naming convention', async () => {
      fs.readdirSync.mockReturnValue(['my_uuid.geojson']);
      tippecanoeAsync.mockResolvedValue();

      const result = await vectorTileTippecanoeUtils.createTippecanoeMBTiles({
        listID: 999,
        numberOfLocations: 100,
        tempFilesPath: '/tmp/list-999',
        uuidString: 'my_uuid',
      });

      expect(result.mbtileFileName).toBe('20260102_120000_100_999_my_uuid.mbtiles');
      expect(result.mbtileOutputFilePath).toBe(
        '/tmp/list-999/20260102_120000_100_999_my_uuid.mbtiles'
      );
    });

    it('should pass correct options to tippecanoe', async () => {
      fs.readdirSync.mockReturnValue(['uuid.geojson']);
      tippecanoeAsync.mockResolvedValue();

      await vectorTileTippecanoeUtils.createTippecanoeMBTiles({
        listID: 111,
        numberOfLocations: 5,
        tempFilesPath: '/tmp',
        uuidString: 'uuid',
      });

      const options = tippecanoeAsync.mock.calls[0][1];
      expect(options.readParallel).toBe(true);
      expect(options.noTileSizeLimit).toBe(true);
      expect(options.layer).toBe('20260102_120000_5_111_uuid');
    });
  });
});
