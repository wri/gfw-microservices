/**
 * @jest-environment node
 */

jest.mock('date-fns', () => ({
  format: jest.fn(() => '20240101_120000'),
}));

jest.mock('mssql', () => ({
  connect: jest.fn(),
  close: jest.fn(),
  Int: 'Int',
  NVarChar: jest.fn((size) => `NVarChar(${size})`),
  MAX: 'MAX',
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  unlinkSync: jest.fn(),
}));

jest.mock('path', () => ({
  basename: jest.fn((p) => p.split('/').pop()),
  join: jest.fn((...args) => args.join('/')),
}));

jest.mock('./vectorTileDB.utils', () => ({
  getListVectorTileS3PathDB: jest.fn(),
}));

jest.mock('./vectorTileS3.utils', () => ({
  deletingMBTileFromS3Bucket: jest.fn(),
}));

jest.mock('../../../config/privateutils/sql.utils', () => ({
  executeOrganizationStoredProcedure: jest.fn(),
}));

jest.mock('../config/vectorTiles.config', () => ({
  VECTOR_TILES_LOCATION: '/tmp/tiles',
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileUtils = require('./vectorTile.utils');
const { getListVectorTileS3PathDB } = require('./vectorTileDB.utils');
const { deletingMBTileFromS3Bucket } = require('./vectorTileS3.utils');
const sqlUtils = require('../../../config/privateutils/sql.utils');
const fs = require('fs');

describe('vectorTile.utils', () => {
  let req;

  beforeEach(() => {
    req = {
      session: { organization_database: 'test_db' },
    };
    jest.clearAllMocks();
  });

  describe('removeExistingVectorTileFromS3', () => {
    it('should remove vector tiles from S3, local cache, and database', async () => {
      getListVectorTileS3PathDB.mockResolvedValue('path/to/file.mbtiles');
      deletingMBTileFromS3Bucket.mockResolvedValue();
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue();
      fs.existsSync.mockReturnValue(true);

      await vectorTileUtils.removeExistingVectorTileFromS3(req, 123);

      expect(deletingMBTileFromS3Bucket).toHaveBeenCalledWith('path/to/file.mbtiles');
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        req,
        'uspUpdateListStringResult',
        expect.arrayContaining([
          expect.objectContaining({ field: 'list_id', value: 123 }),
          expect.objectContaining({ field: 'column_name', value: 'vector_tiles_storage_path' }),
          expect.objectContaining({ field: 'value', value: null }),
        ])
      );
    });

    it('should handle case when no vector tile exists', async () => {
      getListVectorTileS3PathDB.mockResolvedValue(null);

      await vectorTileUtils.removeExistingVectorTileFromS3(req, 123);

      expect(deletingMBTileFromS3Bucket).not.toHaveBeenCalled();
      expect(sqlUtils.executeOrganizationStoredProcedure).not.toHaveBeenCalled();
    });

    it('should continue with DB cleanup even if local file deletion fails', async () => {
      getListVectorTileS3PathDB.mockResolvedValue('path/to/file.mbtiles');
      deletingMBTileFromS3Bucket.mockResolvedValue();
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue();

      await vectorTileUtils.removeExistingVectorTileFromS3(req, 123);

      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalled();
    });

    it('should throw error when database cleanup fails', async () => {
      getListVectorTileS3PathDB.mockResolvedValue('path/to/file.mbtiles');
      deletingMBTileFromS3Bucket.mockResolvedValue();
      sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(new Error('DB error'));

      await expect(vectorTileUtils.removeExistingVectorTileFromS3(req, 123)).rejects.toThrow(
        'Failed to clear vector tile path from database'
      );
    });

    it('should skip local file deletion when file does not exist', async () => {
      getListVectorTileS3PathDB.mockResolvedValue('path/to/file.mbtiles');
      deletingMBTileFromS3Bucket.mockResolvedValue();
      fs.existsSync.mockReturnValue(false);
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue();

      await vectorTileUtils.removeExistingVectorTileFromS3(req, 123);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalled();
    });
  });

  describe('getCurrentDateTimeFormatted', () => {
    it('should return formatted date time string', () => {
      const result = vectorTileUtils.getCurrentDateTimeFormatted();

      expect(result).toBe('20240101_120000');
      expect(typeof result).toBe('string');
    });

    it('should use correct date format', () => {
      const { format } = require('date-fns');

      vectorTileUtils.getCurrentDateTimeFormatted();

      expect(format).toHaveBeenCalledWith(expect.any(Date), 'yyyyMMdd_HHmmss');
    });
  });
});
