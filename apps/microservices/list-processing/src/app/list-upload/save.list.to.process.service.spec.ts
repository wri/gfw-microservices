import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SaveListToProcessService } from './save.list.to.process.service';
import { MetadataService as AWSMetadataService } from '@wri-monorepos/aws';
import { ClientStoreConnection, SQLUtils } from '@wri-monorepos/sql';
import { RequestSaveLargeListProcessModel } from '../../models';
import * as sql from 'mssql';

// Mock the SQLUtils module
jest.mock('@wri-monorepos/sql', () => ({
  ...jest.requireActual('@wri-monorepos/sql'),
  SQLUtils: {
    queryDB: jest.fn(),
  },
}));

// Mock Logger.error as a static method
jest.spyOn(Logger, 'error').mockImplementation(jest.fn());

interface MockRepository {
  findOne: jest.Mock;
  save: jest.Mock;
}

describe('SaveListToProcessService', () => {
  let service: SaveListToProcessService;
  let awsMetadataService: jest.Mocked<AWSMetadataService>;
  let clientStoreConnection: jest.Mocked<ClientStoreConnection>;
  let configService: jest.Mocked<ConfigService>;
  let mockRepository: MockRepository;

  const mockListDetails: RequestSaveLargeListProcessModel = {
    list_id: 123,
    userId: 456,
    listName: 'Test List',
    key: 'test-file.csv',
    client_database: 'test_db',
  };

  beforeEach(async () => {
    // Create mock repository
    mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    // Create mock connection
    const mockConnection = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    // Create mocked services
    const mockAwsMetadataService = {
      getMetadata: jest.fn(),
    };

    const mockClientStoreConnection = {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveListToProcessService,
        {
          provide: AWSMetadataService,
          useValue: mockAwsMetadataService,
        },
        {
          provide: ClientStoreConnection,
          useValue: mockClientStoreConnection,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SaveListToProcessService>(SaveListToProcessService);
    awsMetadataService = module.get(AWSMetadataService);
    clientStoreConnection = module.get(ClientStoreConnection);
    configService = module.get(ConfigService);

    // Setup default mocks
    configService.get.mockReturnValue('test-bucket');
    awsMetadataService.getMetadata.mockResolvedValue({ taskARN: 'test-arn' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('run', () => {
    it('should successfully save list to process and return expected result', async () => {
      // Arrange
      const expectedS3Location = 's3://test-bucket/test-file.csv';
      const updateListsUploadStatusSpy = jest
        .spyOn(service, 'updateListsUploadStatus')
        .mockResolvedValue();
      (SQLUtils.queryDB as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await service.run(mockListDetails);

      // Assert
      expect(configService.get).toHaveBeenCalledWith('LARGE_PROCESSING_LIST_BUCKET');
      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        'test_db',
        `INSERT INTO LargeLists(list_id, organization_user_id, list_name, s3_filename, s3_location, list_status, creation_date) VALUES(@list_id,@organization_user_id,@list_name,@s3_filename,@s3_location,'Created', GETDATE());`,
        [
          {
            field: 'list_id',
            type: sql.Int,
            value: 123,
          },
          {
            field: 'organization_user_id',
            type: sql.Int,
            value: 456,
          },
          {
            field: 'list_name',
            type: sql.NVarChar(255),
            value: 'Test List',
          },
          {
            field: 's3_filename',
            type: sql.NVarChar(255),
            value: 'test-file.csv',
          },
          {
            field: 's3_location',
            type: sql.NVarChar(255),
            value: expectedS3Location,
          },
        ]
      );
      expect(updateListsUploadStatusSpy).toHaveBeenCalledWith(
        'test_db',
        123,
        'Save list to process'
      );
      expect(result).toEqual({
        list_id: 123,
        s3_location: expectedS3Location,
      });
    });

    it('should handle error during SQL query and update status with error', async () => {
      // Arrange
      const sqlError = new Error('SQL connection failed');
      const updateListsUploadStatusSpy = jest
        .spyOn(service, 'updateListsUploadStatus')
        .mockResolvedValue();
      (SQLUtils.queryDB as jest.Mock).mockRejectedValue(sqlError);

      // Act
      const result = await service.run(mockListDetails);

      // Assert
      expect(updateListsUploadStatusSpy).toHaveBeenCalledWith(
        'test_db',
        123,
        null,
        'SQL connection failed'
      );
      expect(Logger.error).toHaveBeenCalledWith(sqlError);
      expect(result).toBe(sqlError);
    });
  });

  describe('updateListsUploadStatus', () => {
    beforeEach(() => {
      awsMetadataService.getMetadata.mockResolvedValue({ taskARN: 'test-task-arn' });
    });

    it('should update existing record when found', async () => {
      // Arrange
      const existingRecord = {
        listId: 123,
        errorInfo: 'old error',
        lastSuccessfulStage: 'old stage',
        updateTime: new Date('2023-01-01'),
        workerInstanceId: 'old-arn',
      };
      mockRepository.findOne.mockResolvedValue(existingRecord);
      mockRepository.save.mockResolvedValue(existingRecord);

      // Act
      await service.updateListsUploadStatus('test_db', 123, 'new stage', 'new error');

      // Assert
      expect(clientStoreConnection.getConnection).toHaveBeenCalledWith('test_db');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { listId: 123 } });
      expect(existingRecord.errorInfo).toBe('new error');
      expect(existingRecord.lastSuccessfulStage).toBe('new stage');
      expect(existingRecord.workerInstanceId).toBe('test-task-arn');
      expect(existingRecord.updateTime).toBeInstanceOf(Date);
      expect(mockRepository.save).toHaveBeenCalledWith(existingRecord);
    });

    it('should create new record when none exists', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue({});

      // Act
      await service.updateListsUploadStatus('test_db', 123, 'new stage', 'new error');

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { listId: 123 } });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          listId: 123,
          errorInfo: 'new error',
          lastSuccessfulStage: 'new stage',
          workerInstanceId: 'test-task-arn',
          updateTime: expect.any(Date),
        })
      );
    });

    it('should use existing lastSuccessfulStage when new stage is null for existing record', async () => {
      // Arrange
      const existingRecord = {
        listId: 123,
        errorInfo: 'old error',
        lastSuccessfulStage: 'existing stage',
        updateTime: new Date('2023-01-01'),
        workerInstanceId: 'old-arn',
      };
      mockRepository.findOne.mockResolvedValue(existingRecord);
      mockRepository.save.mockResolvedValue(existingRecord);

      // Act
      await service.updateListsUploadStatus('test_db', 123, null, 'new error');

      // Assert
      expect(existingRecord.lastSuccessfulStage).toBe('existing stage');
    });

    it('should truncate error info to 511 characters', async () => {
      // Arrange
      const longError = 'a'.repeat(600);
      const existingRecord = {
        listId: 123,
        errorInfo: 'old error',
        lastSuccessfulStage: 'old stage',
        updateTime: new Date('2023-01-01'),
        workerInstanceId: 'old-arn',
      };
      mockRepository.findOne.mockResolvedValue(existingRecord);
      mockRepository.save.mockResolvedValue(existingRecord);

      // Act
      await service.updateListsUploadStatus('test_db', 123, 'new stage', longError);

      // Assert
      expect(existingRecord.errorInfo).toBe('a'.repeat(511));
    });

    it('should handle repository errors and log them', async () => {
      // Arrange
      const repositoryError = new Error('Repository error');
      mockRepository.findOne.mockRejectedValue(repositoryError);

      // Act
      await service.updateListsUploadStatus('test_db', 123, 'new stage', 'new error');

      // Assert
      expect(Logger.error).toHaveBeenCalledWith(
        'Error updating/inserting record:',
        repositoryError.stack
      );
    });

    it('should handle save errors and log them', async () => {
      // Arrange
      const existingRecord = {
        listId: 123,
        errorInfo: 'old error',
        lastSuccessfulStage: 'old stage',
        updateTime: new Date('2023-01-01'),
        workerInstanceId: 'old-arn',
      };
      const saveError = new Error('Save error');
      mockRepository.findOne.mockResolvedValue(existingRecord);
      mockRepository.save.mockRejectedValue(saveError);

      // Act
      await service.updateListsUploadStatus('test_db', 123, 'new stage', 'new error');

      // Assert
      expect(Logger.error).toHaveBeenCalledWith(
        'Error updating/inserting record:',
        saveError.stack
      );
    });

    it('should handle undefined error info', async () => {
      // Arrange
      const existingRecord = {
        listId: 123,
        errorInfo: 'old error',
        lastSuccessfulStage: 'old stage',
        updateTime: new Date('2023-01-01'),
        workerInstanceId: 'old-arn',
      };
      mockRepository.findOne.mockResolvedValue(existingRecord);
      mockRepository.save.mockResolvedValue(existingRecord);

      // Act
      await service.updateListsUploadStatus('test_db', 123, 'new stage', undefined);

      // Assert
      expect(existingRecord.errorInfo).toBeUndefined();
    });
  });
});
