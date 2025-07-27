import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SaveListProcessService } from './save.list.process.service';
import { SQLUtils } from '@wri-monorepos/sql';
import { updateListsUploadStatus } from './shared/update.lists.upload.status';

// Mock the dependencies
jest.mock('@wri-monorepos/sql');
jest.mock('./shared/update.lists.upload.status');

describe('SaveListProcessService', () => {
  let service;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockSQLUtils = jest.mocked(SQLUtils);
  const mockUpdateListsUploadStatus = jest.mocked(updateListsUploadStatus);

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SaveListProcessService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get(SaveListProcessService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('run', () => {
    const mockListDetails = {
      key: 'test-file.csv',
      list_id: 123,
      userId: 456,
      listName: 'Test List',
      client_database: 'test_db',
    };

    const mockBucket = 'test-bucket';
    const expectedS3Route = `s3://${mockBucket}/${mockListDetails.key}`;

    beforeEach(() => {
      mockConfigService.get.mockReturnValue(mockBucket);
    });

    it('should successfully save list process and return result', async () => {
      // Arrange
      mockSQLUtils.queryDB.mockResolvedValue(undefined);
      mockUpdateListsUploadStatus.mockResolvedValue(undefined);

      // Act
      const result = await service.run(mockListDetails);

      // Assert
      expect(mockConfigService.get).toHaveBeenCalledWith('LARGE_PROCESSING_LIST_BUCKET');

      expect(mockSQLUtils.queryDB).toHaveBeenCalledWith(
        mockListDetails.client_database,
        expect.stringContaining('INSERT INTO LargeLists'),
        expect.arrayContaining([
          expect.objectContaining({
            field: 'list_id',
            value: mockListDetails.list_id,
          }),
          expect.objectContaining({
            field: 'organization_user_id',
            value: mockListDetails.userId,
          }),
          expect.objectContaining({
            field: 'list_name',
            value: mockListDetails.listName,
          }),
          expect.objectContaining({
            field: 's3_filename',
            value: mockListDetails.key,
          }),
          expect.objectContaining({
            field: 's3_location',
            value: expectedS3Route,
          }),
        ])
      );

      expect(mockUpdateListsUploadStatus).toHaveBeenCalledWith(
        mockListDetails.client_database,
        mockListDetails.list_id,
        'Save list to process'
      );

      expect(result).toEqual({
        list_id: mockListDetails.list_id,
        s3_location: expectedS3Route,
      });
    });

    it('should handle database insertion error and return error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      mockSQLUtils.queryDB.mockRejectedValue(mockError);
      mockUpdateListsUploadStatus.mockResolvedValue(undefined);

      const loggerErrorSpy = jest.spyOn(Logger, 'error').mockImplementation();

      // Act
      const result = await service.run(mockListDetails);

      // Assert
      expect(mockSQLUtils.queryDB).toHaveBeenCalled();

      expect(mockUpdateListsUploadStatus).toHaveBeenCalledWith(
        mockListDetails.client_database,
        mockListDetails.list_id,
        null,
        mockError.message
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(mockError);
      expect(result).toBe(mockError);
    });

    it('should handle updateListsUploadStatus error during success flow', async () => {
      // Arrange
      const mockError = new Error('Update status failed');
      mockSQLUtils.queryDB.mockResolvedValue(undefined);

      // Make the first call fail, then subsequent calls succeed
      mockUpdateListsUploadStatus.mockRejectedValueOnce(mockError).mockResolvedValue(undefined);

      const loggerErrorSpy = jest.spyOn(Logger, 'error').mockImplementation();

      // Act
      const result = await service.run(mockListDetails);

      // Assert
      expect(mockSQLUtils.queryDB).toHaveBeenCalled();
      expect(mockUpdateListsUploadStatus).toHaveBeenCalledTimes(2);

      // First call should be with success message
      expect(mockUpdateListsUploadStatus).toHaveBeenNthCalledWith(
        1,
        mockListDetails.client_database,
        mockListDetails.list_id,
        'Save list to process'
      );

      // Second call should be in catch block with error
      expect(mockUpdateListsUploadStatus).toHaveBeenNthCalledWith(
        2,
        mockListDetails.client_database,
        mockListDetails.list_id,
        null,
        mockError.message
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(mockError);
      expect(result).toBe(mockError);
    });

    it('should construct proper S3 route with config bucket', async () => {
      // Arrange
      const customBucket = 'custom-processing-bucket';
      mockConfigService.get.mockReturnValue(customBucket);
      mockSQLUtils.queryDB.mockResolvedValue(undefined);
      mockUpdateListsUploadStatus.mockResolvedValue(undefined);

      // Act
      const result = await service.run(mockListDetails);

      // Assert
      const expectedCustomS3Route = `s3://${customBucket}/${mockListDetails.key}`;
      expect(result.s3_location).toBe(expectedCustomS3Route);

      expect(mockSQLUtils.queryDB).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({
            field: 's3_location',
            value: expectedCustomS3Route,
          }),
        ])
      );
    });

    it('should pass correct SQL parameters with proper types', async () => {
      // Arrange
      mockSQLUtils.queryDB.mockResolvedValue(undefined);
      mockUpdateListsUploadStatus.mockResolvedValue(undefined);

      // Act
      await service.run(mockListDetails);

      // Assert
      const sqlCall = mockSQLUtils.queryDB.mock.calls[0];
      const parameters = sqlCall[2];

      expect(parameters).toHaveLength(5);
      expect(parameters[0]).toMatchObject({
        field: 'list_id',
        value: mockListDetails.list_id,
      });
      expect(parameters[1]).toMatchObject({
        field: 'organization_user_id',
        value: mockListDetails.userId,
      });
      expect(parameters[2]).toMatchObject({
        field: 'list_name',
        value: mockListDetails.listName,
      });
      expect(parameters[3]).toMatchObject({
        field: 's3_filename',
        value: mockListDetails.key,
      });
      expect(parameters[4]).toMatchObject({
        field: 's3_location',
        value: expectedS3Route,
      });
    });
  });

  describe('constructor', () => {
    it('should be instantiated with ConfigService', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(SaveListProcessService);
    });
  });
});
