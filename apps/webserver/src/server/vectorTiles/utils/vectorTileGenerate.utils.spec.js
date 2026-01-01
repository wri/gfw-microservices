const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileGenerateUtils = require('./vectorTileGenerate.utils');
const vectorTileDBUtils = require('./vectorTileDB.utils');
const vectorTileGeojsonUtils = require('./vectorTileGeojson.utils');
const vectorTileTippecanoeUtils = require('./vectorTileTippecanoe.utils');
const vectorTileS3Utils = require('./vectorTileS3.utils');

jest.mock('./vectorTileDB.utils');
jest.mock('./vectorTileGeojson.utils');
jest.mock('./vectorTileTippecanoe.utils');
jest.mock('./vectorTileS3.utils');

describe('vectorTileGenerate.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTilesForList', () => {
    it('should complete full tile generation pipeline', async () => {
      const mockGeometry = [{ location_id: 1, Geometry: 'POINT(0 0)' }];
      const mockGeojson = { type: 'FeatureCollection', features: [] };
      const mockTileBuffer = Buffer.from('tile data');

      vectorTileDBUtils.getListGeometry.mockResolvedValue(mockGeometry);
      vectorTileGeojsonUtils.convertToGeojson.mockReturnValue(mockGeojson);
      vectorTileTippecanoeUtils.generateTiles.mockResolvedValue([mockTileBuffer]);
      vectorTileS3Utils.uploadTiles.mockResolvedValue({ uploaded: 1 });
      vectorTileDBUtils.saveGenerationStatus.mockResolvedValue(true);

      const result = await vectorTileGenerateUtils.generateTilesForList('list123', 'db-client');

      expect(result).toHaveProperty('status', 'completed');
      expect(result).toHaveProperty('tilesGenerated');
      expect(vectorTileDBUtils.getListGeometry).toHaveBeenCalledWith('list123', 'db-client');
      expect(vectorTileGeojsonUtils.convertToGeojson).toHaveBeenCalledWith(mockGeometry);
      expect(vectorTileTippecanoeUtils.generateTiles).toHaveBeenCalled();
      expect(vectorTileS3Utils.uploadTiles).toHaveBeenCalled();
    });

    it('should handle empty geometry data', async () => {
      vectorTileDBUtils.getListGeometry.mockResolvedValue([]);

      const result = await vectorTileGenerateUtils.generateTilesForList('list999', 'db-client');

      expect(result).toHaveProperty('status', 'failed');
      expect(result).toHaveProperty('error', expect.stringContaining('No geometry'));
    });

    it('should save error status on failure', async () => {
      vectorTileDBUtils.getListGeometry.mockRejectedValue(new Error('DB error'));
      vectorTileDBUtils.saveGenerationStatus.mockResolvedValue(true);

      await expect(
        vectorTileGenerateUtils.generateTilesForList('list123', 'db-client')
      ).rejects.toThrow('DB error');

      expect(vectorTileDBUtils.saveGenerationStatus).toHaveBeenCalledWith(
        'list123',
        'failed',
        expect.any(Number)
      );
    });
  });

  describe('deleteVectorTiles', () => {
    it('should delete tiles from S3 and database status', async () => {
      vectorTileS3Utils.deleteTilesForList.mockResolvedValue({ deleted: 50 });
      vectorTileDBUtils.deleteGenerationStatus.mockResolvedValue(true);

      const result = await vectorTileGenerateUtils.deleteVectorTiles('list123');

      expect(result).toEqual({ deleted: 50 });
      expect(vectorTileS3Utils.deleteTilesForList).toHaveBeenCalledWith('list123');
      expect(vectorTileDBUtils.deleteGenerationStatus).toHaveBeenCalledWith('list123');
    });

    it('should handle deletion errors gracefully', async () => {
      vectorTileS3Utils.deleteTilesForList.mockRejectedValue(new Error('S3 error'));

      await expect(vectorTileGenerateUtils.deleteVectorTiles('list123')).rejects.toThrow(
        'S3 error'
      );
    });
  });

  describe('getGenerationStatus', () => {
    it('should retrieve status from database', async () => {
      const mockStatus = { status: 'processing', progress: 75 };
      vectorTileDBUtils.getGenerationStatus.mockResolvedValue(mockStatus);

      const result = await vectorTileGenerateUtils.getGenerationStatus('list123');

      expect(result).toEqual(mockStatus);
    });
  });
});
