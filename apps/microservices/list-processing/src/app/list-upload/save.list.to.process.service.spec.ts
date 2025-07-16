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

// Mock the shared updateListsUploadStatus function
jest.mock('./shared/update.lists.upload.status', () => ({
  updateListsUploadStatus: jest.fn(),
}));

// Mock Logger.error as a static method
jest.spyOn(Logger, 'error').mockImplementation(jest.fn());

// Import the mocked function for type checking
import { updateListsUploadStatus } from './shared/update.lists.upload.status';

describe('SaveListToProcessService', () => {
  let service: SaveListToProcessService;
  let awsMetadataService: jest.Mocked<AWSMetadataService>;
  let configService: jest.Mocked<ConfigService>;

  const mockListDetails: RequestSaveLargeListProcessModel = {
    list_id: 123,
    userId: 456,
    listName: 'Test List',
    key: 'test-file.csv',
    client_database: 'test_db',
  };

  beforeEach(async () => {
    // Create mocked services
    const mockAwsMetadataService = {
      getMetadata: jest.fn(),
    };

    const mockClientStoreConnection = {
      getConnection: jest.fn(),
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
      (updateListsUploadStatus as jest.Mock).mockResolvedValue(undefined);
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
      expect(updateListsUploadStatus).toHaveBeenCalledWith(
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
      (updateListsUploadStatus as jest.Mock).mockResolvedValue(undefined);
      (SQLUtils.queryDB as jest.Mock).mockRejectedValue(sqlError);

      // Act
      const result = await service.run(mockListDetails);

      // Assert
      expect(updateListsUploadStatus).toHaveBeenCalledWith(
        'test_db',
        123,
        null,
        'SQL connection failed'
      );
      expect(Logger.error).toHaveBeenCalledWith(sqlError);
      expect(result).toBe(sqlError);
    });
  });
});
