import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ListUploadService } from './list-upload.service';
import { StartAnalysisService } from './start.analysis.service';
import { CreateLargeListService } from './create.large.list.service';
import { SaveListProcessService } from './save.list.process.service';

jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('@aws-sdk/client-s3');
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-123'),
}));

describe('ListUploadService', () => {
  let service;
  let configService;
  let dataSource;
  let startAnalysisService;
  let createLargeListService;
  let saveListProcessService;
  let queryRunner;
  let mockRepository;

  const mockConfig = {
    AWS_REGION: 'us-east-1',
    LARGE_PROCESSING_LIST_BUCKET: 'test-bucket',
  };

  beforeEach(async () => {
    const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
    mockGetSignedUrl.mockResolvedValue('https://signed-url.com');

    mockRepository = {
      find: jest.fn(),
    };

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      connection: {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        ListUploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => mockConfig[key]),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
        {
          provide: StartAnalysisService,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: CreateLargeListService,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: SaveListProcessService,
          useValue: {
            run: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ListUploadService);
    configService = module.get(ConfigService);
    dataSource = module.get(DataSource);
    startAnalysisService = module.get(StartAnalysisService);
    createLargeListService = module.get(CreateLargeListService);
    saveListProcessService = module.get(SaveListProcessService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePreSignedUrl', () => {
    it('should generate pre-signed URL with new UUID when replaceFile is false', async () => {
      const result = await service.generatePreSignedUrl('test-file.csv', 'text/csv', false);

      expect(result).toEqual({
        url: 'https://signed-url.com',
        keyFile: 'mock-uuid-123-test-file.csv',
        fileS3Route: 's3://test-bucket/mock-uuid-123-test-file.csv',
      });
      expect(getSignedUrl).toHaveBeenCalled();
      expect(configService.get).toHaveBeenCalledWith('LARGE_PROCESSING_LIST_BUCKET', {
        infer: true,
      });
    });

    it('should generate pre-signed URL with original key when replaceFile is true', async () => {
      const result = await service.generatePreSignedUrl('test-file.csv', 'text/csv', true);

      expect(result).toEqual({
        url: 'https://signed-url.com',
        keyFile: 'test-file.csv',
        fileS3Route: 's3://test-bucket/test-file.csv',
      });
    });

    it('should use correct S3 command parameters', async () => {
      await service.generatePreSignedUrl('test-file.csv', 'text/csv', false);

      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'mock-uuid-123-test-file.csv',
        ContentType: 'text/csv',
      });
    });
  });

  describe('getObjectPreSignedUrl', () => {
    it('should generate pre-signed URL for getting object', async () => {
      const result = await service.getObjectPreSignedUrl('test-key');

      expect(result).toEqual({
        url: 'https://signed-url.com',
      });
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'test-key',
      });
      expect(getSignedUrl).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), {
        expiresIn: 300,
      });
    });
  });

  describe('getFilenameForUser', () => {
    it('should return list of files for user', async () => {
      const mockData = [
        { id: 1, list_name: 'Test List 1', list_locations_count: 100 },
        { id: 2, list_name: 'Test List 2', list_locations_count: 200 },
      ];
      mockRepository.find.mockResolvedValue(mockData);

      const result = await service.getFilenameForUser();

      expect(result).toEqual(mockData);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should handle database connection setup correctly', async () => {
      mockRepository.find.mockResolvedValue([]);

      await service.getFilenameForUser();

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
    });
  });

  describe('createNewList', () => {
    const mockCreateListRequest = {
      listName: 'Test List',
      userId: 123,
      clientDatabase: 'test-db',
      analysisIds: ['analysis1', 'analysis2'],
      saveAsDraft: false,
    };

    it('should create new list successfully', async () => {
      const mockListResult = { list_id: 456 };
      createLargeListService.run.mockResolvedValue(mockListResult);
      saveListProcessService.run.mockResolvedValue({ success: true });

      await service.createNewList(mockCreateListRequest);

      expect(createLargeListService.run).toHaveBeenCalledWith({
        listName: 'Test List',
        userId: 123,
        clientDatabase: 'test-db',
        analysisIds: ['analysis1', 'analysis2'],
        saveAsDraft: false,
      });

      expect(saveListProcessService.run).toHaveBeenCalledWith({
        key: 'Test List',
        userId: 123,
        list_id: 456,
        listName: 'Test List',
        client_database: 'test-db',
      });
    });

    it('should handle errors during list creation', async () => {
      const error = new Error('Database error');
      createLargeListService.run.mockRejectedValue(error);

      const result = await service.createNewList(mockCreateListRequest);

      expect(result).toBeInstanceOf(InternalServerErrorException);
      expect(result.message).toBe('Database error');
    });

    it('should handle errors during save list process', async () => {
      const mockListResult = { list_id: 456 };
      createLargeListService.run.mockResolvedValue(mockListResult);
      saveListProcessService.run.mockRejectedValue(new Error('Save error'));

      const result = await service.createNewList(mockCreateListRequest);

      expect(result).toBeInstanceOf(InternalServerErrorException);
      expect(result.message).toBe('Save error');
    });
  });

  describe('startAnalysisProcessForList', () => {
    it('should start analysis process and strip S3 bucket from path', async () => {
      const mockRequest = {
        path: 's3://test-bucket/some-file.csv',
        listId: 123,
        userId: 456,
      };
      const mockResponse = { analysisId: 'analysis-123', status: 'started' };
      startAnalysisService.run.mockResolvedValue(mockResponse);

      const result = await service.startAnalysisProcessForList(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(startAnalysisService.run).toHaveBeenCalledWith({
        path: 'some-file.csv',
        listId: 123,
        userId: 456,
      });
    });

    it('should handle path without S3 bucket prefix', async () => {
      const mockRequest = {
        path: 'some-file.csv',
        listId: 123,
        userId: 456,
      };
      const mockResponse = { analysisId: 'analysis-123', status: 'started' };
      startAnalysisService.run.mockResolvedValue(mockResponse);

      const result = await service.startAnalysisProcessForList(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(startAnalysisService.run).toHaveBeenCalledWith({
        path: 'some-file.csv',
        listId: 123,
        userId: 456,
      });
    });
  });

  describe('createListTables', () => {
    it('should delegate to createLargeListService', async () => {
      const mockRequest = {
        listName: 'Test List',
        userId: 123,
        clientDatabase: 'test-db',
        analysisIds: ['analysis1'],
        saveAsDraft: false,
      };
      const mockResult = { list_id: 789 };
      createLargeListService.run.mockResolvedValue(mockResult);

      const result = await service.createListTables(mockRequest);

      expect(result).toEqual(mockResult);
      expect(createLargeListService.run).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('saveListToProcess', () => {
    it('should delegate to saveListProcessService', async () => {
      const mockListDetails = {
        key: 'test-key',
        userId: 123,
        list_id: 456,
        listName: 'Test List',
        client_database: 'test-db',
      };
      const mockResult = { id: 'insert-123', success: true };
      saveListProcessService.run.mockResolvedValue(mockResult);

      const result = await service.saveListToProcess(mockListDetails);

      expect(result).toEqual(mockResult);
      expect(saveListProcessService.run).toHaveBeenCalledWith(mockListDetails);
    });
  });

  describe('constructor and initialization', () => {
    it('should initialize S3Client with correct region', () => {
      expect(configService.get).toHaveBeenCalledWith('AWS_REGION', { infer: true });
      expect(S3Client).toHaveBeenCalledWith({ region: 'us-east-1' });
    });
  });

  describe('error handling', () => {
    it('should handle AWS S3 errors in generatePreSignedUrl', async () => {
      const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
      mockGetSignedUrl.mockRejectedValue(new Error('AWS Error'));

      await expect(service.generatePreSignedUrl('test.csv', 'text/csv')).rejects.toThrow(
        'AWS Error'
      );
    });

    it('should handle AWS S3 errors in getObjectPreSignedUrl', async () => {
      const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
      mockGetSignedUrl.mockRejectedValue(new Error('AWS Get Error'));

      await expect(service.getObjectPreSignedUrl('test-key')).rejects.toThrow('AWS Get Error');
    });
  });
});
