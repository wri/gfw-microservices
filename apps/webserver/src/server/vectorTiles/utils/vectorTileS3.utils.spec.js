/**
 * @jest-environment node
 */

jest.mock('@aws-sdk/client-s3', () => ({
  S3: jest.fn(),
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

jest.mock('node:fs/promises', () => ({
  writeFile: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  basename: jest.fn((p) => p.split('/').pop()),
}));

jest.mock('../config/vectorTiles.config', () => ({
  VECTOR_TILES_LOCATION: '/var/tiles',
  MBTILE_S3_BUCKET: 's3://test-bucket',
  MBTILE_S3_BUCKET_NAME: 'test-bucket',
  MBTILE_S3_BUCKET_PATH: 'vector-tiles',
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileS3Utils = require('./vectorTileS3.utils');
const { S3 } = require('@aws-sdk/client-s3');
const fs = require('fs');
const { writeFile } = require('node:fs/promises');

describe('vectorTileS3.utils', () => {
  let mockS3Instance;

  beforeEach(() => {
    mockS3Instance = {
      putObject: jest.fn(),
      deleteObject: jest.fn(),
      getObject: jest.fn(),
    };

    S3.mockImplementation(() => mockS3Instance);
    jest.clearAllMocks();
  });

  describe('uploadMBTileToS3Bucket', () => {
    it('should upload mbtile to S3 bucket', async () => {
      const mockFileContent = Buffer.from('mbtile data');
      fs.readFileSync.mockReturnValue(mockFileContent);
      mockS3Instance.putObject.mockImplementation((params, callback) => {
        callback(null);
      });

      const result = await vectorTileS3Utils.uploadMBTileToS3Bucket(
        'list-123.mbtiles',
        '/tmp/list-123.mbtiles'
      );

      expect(result).toEqual({ mbtileS3FilePath: 's3://test-bucket/list-123.mbtiles' });
      expect(fs.readFileSync).toHaveBeenCalledWith('/tmp/list-123.mbtiles');
      expect(mockS3Instance.putObject).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: 'vector-tiles/list-123.mbtiles',
          Body: mockFileContent,
          ContentType: 'application/x-sqlite3',
        }),
        expect.any(Function)
      );
    });

    it('should handle upload failures', async () => {
      fs.readFileSync.mockReturnValue(Buffer.from('data'));
      mockS3Instance.putObject.mockImplementation((params, callback) => {
        callback(new Error('Upload failed'));
      });

      await expect(
        vectorTileS3Utils.uploadMBTileToS3Bucket('list-123.mbtiles', '/tmp/list-123.mbtiles')
      ).rejects.toThrow('MBTile addition to S3 bucket failed');
    });
  });

  describe('deletingMBTileFromS3Bucket', () => {
    it('should delete mbtile from S3 bucket', async () => {
      mockS3Instance.deleteObject.mockImplementation((params, callback) => {
        callback(null);
      });

      const result = await vectorTileS3Utils.deletingMBTileFromS3Bucket(
        's3://test-bucket/list-123.mbtiles'
      );

      expect(result).toEqual({ message: 'MBTile deleted from S3 bucket' });
      expect(mockS3Instance.deleteObject).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: 'vector-tiles/list-123.mbtiles',
        }),
        expect.any(Function)
      );
    });

    it('should handle deletion errors', async () => {
      mockS3Instance.deleteObject.mockImplementation((params, callback) => {
        callback(new Error('Delete failed'));
      });

      await expect(
        vectorTileS3Utils.deletingMBTileFromS3Bucket('s3://test-bucket/list-123.mbtiles')
      ).rejects.toThrow('Deleting MBTile from S3 bucket failed');
    });
  });

  describe('getMBTileFromS3Bucket', () => {
    it('should download mbtile from S3 bucket', async () => {
      const mockData = { Body: Buffer.from('mbtile data') };
      mockS3Instance.getObject.mockImplementation((params, callback) => {
        callback(null, mockData);
      });
      writeFile.mockResolvedValue();

      const result = await vectorTileS3Utils.getMBTileFromS3Bucket(
        's3://test-bucket/list-123.mbtiles'
      );

      expect(result).toEqual({
        message: 'MBTile retrieved from S3 bucket',
        mbtileFilePath: '/var/tiles/list-123.mbtiles',
      });
      expect(mockS3Instance.getObject).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: 'vector-tiles/list-123.mbtiles',
        }),
        expect.any(Function)
      );
      expect(writeFile).toHaveBeenCalledWith('/var/tiles/list-123.mbtiles', mockData.Body);
    });

    it('should handle S3 download errors', async () => {
      mockS3Instance.getObject.mockImplementation((params, callback) => {
        callback(new Error('Access denied'));
      });

      await expect(
        vectorTileS3Utils.getMBTileFromS3Bucket('s3://test-bucket/list-123.mbtiles')
      ).rejects.toThrow('Getting MBTile Vector Tiles from S3 bucket failed');
    });

    it('should handle file write errors', async () => {
      const mockData = { Body: Buffer.from('mbtile data') };
      mockS3Instance.getObject.mockImplementation((params, callback) => {
        callback(null, mockData);
      });
      writeFile.mockRejectedValue(new Error('Write failed'));

      await expect(
        vectorTileS3Utils.getMBTileFromS3Bucket('s3://test-bucket/list-123.mbtiles')
      ).rejects.toThrow('Getting MBTile Vector Tiles from S3 bucket failed');
    });
  });
});
