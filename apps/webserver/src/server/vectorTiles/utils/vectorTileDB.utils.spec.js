/**
 * @jest-environment node
 */

jest.mock('mssql', () => ({
  connect: jest.fn(),
  close: jest.fn(),
  Int: 'Int',
  NVarChar: jest.fn((size) => `NVarChar(${size})`),
  MAX: 'MAX',
  DateTime: 'DateTime',
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../../../config/privateutils/sql.utils', () => ({
  executeOrganizationStoredProcedure: jest.fn(),
}));

const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileDBUtils = require('./vectorTileDB.utils');
const sqlUtils = require('../../../config/privateutils/sql.utils');

describe('vectorTileDB.utils', () => {
  let req;

  beforeEach(() => {
    req = {
      session: { organization_database: 'test_db' },
    };
    jest.clearAllMocks();
  });

  describe('updateListVectorTilesStoragePathDB', () => {
    it('should update vector tiles storage path in database', async () => {
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([]);

      await vectorTileDBUtils.updateListVectorTilesStoragePathDB(
        req,
        123,
        's3://bucket/path/to/file.mbtiles'
      );

      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledTimes(2);
      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        req,
        'uspUpdateListStringResult',
        expect.arrayContaining([
          expect.objectContaining({ field: 'list_id', value: 123 }),
          expect.objectContaining({ field: 'column_name', value: 'vector_tiles_storage_path' }),
          expect.objectContaining({ field: 'value', value: 's3://bucket/path/to/file.mbtiles' }),
        ])
      );
      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        req,
        'uspSetDashboardTimestamp',
        expect.arrayContaining([
          expect.objectContaining({ field: 'list_id_array', value: 123 }),
          expect.objectContaining({ field: 'column_name', value: 'vector_tiles_last_updated' }),
          expect.objectContaining({ field: 'value' }),
        ])
      );
    });

    it('should throw error when storage path update fails', async () => {
      sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(new Error('DB error'));

      await expect(
        vectorTileDBUtils.updateListVectorTilesStoragePathDB(req, 123, 's3://bucket/file.mbtiles')
      ).rejects.toThrow('Updating List Vector Tiles Storage Path in DB failed');
    });

    it('should throw error when last updated timestamp update fails', async () => {
      sqlUtils.executeOrganizationStoredProcedure
        .mockResolvedValueOnce([]) // First call succeeds
        .mockRejectedValueOnce(new Error('Timestamp update failed')); // Second call fails

      await expect(
        vectorTileDBUtils.updateListVectorTilesStoragePathDB(req, 123, 's3://bucket/file.mbtiles')
      ).rejects.toThrow('Updating List Vector Tiles last updated in DB failed');
    });
  });

  describe('getListVectorTileS3PathDB', () => {
    it('should retrieve vector tile S3 path from database', async () => {
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([
        { vector_tiles_storage_path: 's3://bucket/path/to/file.mbtiles' },
      ]);

      const result = await vectorTileDBUtils.getListVectorTileS3PathDB(req, 123);

      expect(result).toBe('s3://bucket/path/to/file.mbtiles');
      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        req,
        'uspGetListVectorTilesPath',
        expect.arrayContaining([expect.objectContaining({ field: 'list_id', value: 123 })])
      );
    });

    it('should return null when no path exists', async () => {
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([
        { vector_tiles_storage_path: null },
      ]);

      const result = await vectorTileDBUtils.getListVectorTileS3PathDB(req, 123);

      expect(result).toBeNull();
    });

    it('should return null when no record found', async () => {
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([]);

      const result = await vectorTileDBUtils.getListVectorTileS3PathDB(req, 999);

      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(new Error('DB error'));

      await expect(vectorTileDBUtils.getListVectorTileS3PathDB(req, 123)).rejects.toThrow(
        'Getting List Vector Tiles S3 Path from DB failed'
      );
    });
  });
});
