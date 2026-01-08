/**
 * @jest-environment node
 */

jest.mock('fs', () => ({
  writeFile: jest.fn((path, data, callback) => {
    // Call callback synchronously with no error
    callback(null);
  }),
  mkdirSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

jest.mock('../../../config/config/locations.config', () => ({
  DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED: 1000,
}));

jest.mock('./vectorTile.utils', () => ({
  getCurrentDateTimeFormatted: jest.fn(() => '20240101_120000'),
}));

jest.mock('../../../config/publicutils/listManager.utils', () => ({
  getListLocations: jest.fn(),
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileGeojsonUtils = require('./vectorTileGeojson.utils');
const ListManager = require('../../../config/publicutils/listManager.utils');
const fs = require('fs');

describe('vectorTileGeojson.utils', () => {
  let req;

  beforeEach(() => {
    req = {
      session: { organization_database: 'test_db' },
    };
    jest.clearAllMocks();
    // Reset fs.writeFile to default success behavior
    fs.writeFile.mockImplementation((path, data, callback) => {
      callback(null);
    });
  });

  describe('createTempGeojsonFile', () => {
    it('should create geojson file from list locations', async () => {
      const mockGeojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: { location_id: 1, name: 'Location 1' },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [1, 1] },
            properties: { location_id: 2, name: 'Location 2' },
          },
        ],
      };

      ListManager.getListLocations.mockResolvedValue(mockGeojson);

      const result = await vectorTileGeojsonUtils.createTempGeojsonFile(
        req,
        'uuid-123',
        '/tmp/list-1',
        1,
        0
      );

      expect(result).toEqual({ lastLocationID: 3 });
      expect(fs.mkdirSync).toHaveBeenCalledWith('/tmp/list-1', { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/tmp/list-1/20240101_120000_2_1_uuid-123.geojson',
        JSON.stringify(mockGeojson),
        expect.any(Function)
      );
    });

    it('should handle file write errors', async () => {
      const mockGeojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: { location_id: 1 },
          },
        ],
      };

      ListManager.getListLocations.mockResolvedValue(mockGeojson);
      fs.writeFile.mockImplementation((path, data, callback) => {
        callback(new Error('Write failed'));
      });

      await expect(
        vectorTileGeojsonUtils.createTempGeojsonFile(req, 'uuid-123', '/tmp/list-1', 1, 0)
      ).rejects.toThrow('Creating Temp Geojson file failed');
    });

    it('should handle list locations fetch errors', async () => {
      ListManager.getListLocations.mockRejectedValue(new Error('DB error'));

      await expect(
        vectorTileGeojsonUtils.createTempGeojsonFile(req, 'uuid-123', '/tmp/list-1', 1, 0)
      ).rejects.toThrow('Getting List Geojson for list ID: 1 failed');
    });
  });

  describe('createTempGeojsonFiles', () => {
    it('should create multiple geojson files for large lists', async () => {
      const mockGeojson = {
        type: 'FeatureCollection',
        features: Array.from({ length: 1000 }, (_, i) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [i, i] },
          properties: { location_id: i + 1 },
        })),
      };

      ListManager.getListLocations.mockResolvedValue(mockGeojson);

      await vectorTileGeojsonUtils.createTempGeojsonFiles(req, 2500, 'uuid-123', '/tmp/list-1', 1);

      // Should create 3 chunks (1000 + 1000 + 500)
      expect(ListManager.getListLocations).toHaveBeenCalledTimes(3);
      expect(fs.writeFile).toHaveBeenCalledTimes(3);
    });

    it('should create single file for small lists', async () => {
      const mockGeojson = {
        type: 'FeatureCollection',
        features: Array.from({ length: 100 }, (_, i) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [i, i] },
          properties: { location_id: i + 1 },
        })),
      };

      ListManager.getListLocations.mockResolvedValue(mockGeojson);

      await vectorTileGeojsonUtils.createTempGeojsonFiles(req, 100, 'uuid-123', '/tmp/list-1', 1);

      expect(ListManager.getListLocations).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    it('should pass correct location IDs for each chunk', async () => {
      const mockGeojson = {
        type: 'FeatureCollection',
        features: Array.from({ length: 1000 }, (_, i) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [i, i] },
          properties: { location_id: i + 1 },
        })),
      };

      ListManager.getListLocations.mockResolvedValue(mockGeojson);

      await vectorTileGeojsonUtils.createTempGeojsonFiles(req, 2000, 'uuid-123', '/tmp/list-1', 1);

      expect(ListManager.getListLocations).toHaveBeenNthCalledWith(1, req, 1, 0);
      expect(ListManager.getListLocations).toHaveBeenNthCalledWith(2, req, 1, 1001);
    });
  });
});
