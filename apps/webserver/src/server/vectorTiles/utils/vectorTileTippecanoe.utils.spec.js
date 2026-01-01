const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileTippecanoeUtils = require('./vectorTileTippecanoe.utils');
const { exec } = require('child_process');
const fs = require('fs');

jest.mock('child_process');
jest.mock('fs');

describe('vectorTileTippecanoe.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTiles', () => {
    it('should generate tiles using tippecanoe', async () => {
      const mockGeojson = { type: 'FeatureCollection', features: [] };

      fs.writeFileSync.mockImplementation(jest.fn);
      fs.readFileSync.mockReturnValue(Buffer.from('tile data'));
      fs.unlinkSync.mockImplementation(jest.fn);

      exec.mockImplementation((cmd, callback) => {
        callback(null, 'Success', '');
      });

      const result = await vectorTileTippecanoeUtils.generateTiles(mockGeojson, {
        minZoom: 0,
        maxZoom: 14,
      });

      expect(result).toBeDefined();
      expect(exec).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should use default zoom levels if not specified', async () => {
      const mockGeojson = { type: 'FeatureCollection', features: [] };

      fs.writeFileSync.mockImplementation(jest.fn);
      exec.mockImplementation((cmd, callback) => {
        callback(null, 'Success', '');
      });

      await vectorTileTippecanoeUtils.generateTiles(mockGeojson);

      const execCall = exec.mock.calls[0][0];
      expect(execCall).toContain('-z');
      expect(execCall).toContain('-Z');
    });

    it('should handle tippecanoe errors', async () => {
      const mockGeojson = { type: 'FeatureCollection', features: [] };

      fs.writeFileSync.mockImplementation(jest.fn);
      exec.mockImplementation((cmd, callback) => {
        callback(new Error('Tippecanoe failed'), '', 'Error output');
      });

      await expect(vectorTileTippecanoeUtils.generateTiles(mockGeojson)).rejects.toThrow(
        'Tippecanoe failed'
      );
    });

    it('should clean up temporary files on error', async () => {
      const mockGeojson = { type: 'FeatureCollection', features: [] };

      fs.writeFileSync.mockImplementation(jest.fn);
      fs.unlinkSync.mockImplementation(jest.fn);
      exec.mockImplementation((cmd, callback) => {
        callback(new Error('Failed'), '', '');
      });

      await expect(vectorTileTippecanoeUtils.generateTiles(mockGeojson)).rejects.toThrow();

      expect(fs.unlinkSync).toHaveBeenCalled();
    });
  });

  describe('validateTippecanoeInstalled', () => {
    it('should return true when tippecanoe is installed', async () => {
      exec.mockImplementation((cmd, callback) => {
        callback(null, 'tippecanoe v1.0', '');
      });

      const result = await vectorTileTippecanoeUtils.validateTippecanoeInstalled();

      expect(result).toBe(true);
    });

    it('should return false when tippecanoe is not installed', async () => {
      exec.mockImplementation((cmd, callback) => {
        callback(new Error('command not found'), '', '');
      });

      const result = await vectorTileTippecanoeUtils.validateTippecanoeInstalled();

      expect(result).toBe(false);
    });
  });
});
