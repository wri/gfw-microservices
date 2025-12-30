const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileDBUtils = require('./vectorTileDB.utils');
const sql = require('mssql');

jest.mock('mssql');

describe('vectorTileDB.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListGeometry', () => {
    it('should fetch geometry data for a list', async () => {
      const mockRecordset = [
        { location_id: 1, Geometry: 'POINT(0 0)' },
        { location_id: 2, Geometry: 'POINT(1 1)' },
      ];

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ recordset: mockRecordset }),
        }),
        close: jest.fn(),
      });

      const result = await vectorTileDBUtils.getListGeometry('list123', 'db-client');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('location_id', 1);
      expect(sql.connect).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      sql.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(
        vectorTileDBUtils.getListGeometry('list123', 'db-client')
      ).rejects.toThrow('Connection failed');
    });

    it('should return empty array when no data found', async () => {
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ recordset: [] }),
        }),
        close: jest.fn(),
      });

      const result = await vectorTileDBUtils.getListGeometry('list999', 'db-client');

      expect(result).toEqual([]);
    });
  });

  describe('saveGenerationStatus', () => {
    it('should save generation status to database', async () => {
      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
      };

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn(),
      });

      await vectorTileDBUtils.saveGenerationStatus('list123', 'processing', 50);

      expect(mockRequest.input).toHaveBeenCalledWith('listId', expect.anything(), 'list123');
      expect(mockRequest.input).toHaveBeenCalledWith('status', expect.anything(), 'processing');
      expect(mockRequest.input).toHaveBeenCalledWith('progress', expect.anything(), 50);
      expect(mockRequest.query).toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      sql.connect.mockRejectedValue(new Error('Save failed'));

      await expect(
        vectorTileDBUtils.saveGenerationStatus('list123', 'error', 0)
      ).rejects.toThrow('Save failed');
    });
  });

  describe('getGenerationStatus', () => {
    it('should retrieve generation status from database', async () => {
      const mockStatus = { status: 'completed', progress: 100, created_at: new Date() };

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ recordset: [mockStatus] }),
        }),
        close: jest.fn(),
      });

      const result = await vectorTileDBUtils.getGenerationStatus('list123');

      expect(result).toEqual(mockStatus);
    });

    it('should return null when status not found', async () => {
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ recordset: [] }),
        }),
        close: jest.fn(),
      });

      const result = await vectorTileDBUtils.getGenerationStatus('list999');

      expect(result).toBeNull();
    });
  });
});