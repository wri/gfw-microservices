import { Test, TestingModule } from '@nestjs/testing';
import { ListUploadController } from './list-upload.controller';
import { ListUploadService } from './list-upload.service';
import {
  GetObjectPresigned,
  RequestPreSignedURLModel,
  RequestSaveLargeListProcessModel,
  RequestLargeListProcess,
  RequestTriggerProcessLargeList,
  ResponsePreSignedURLModel,
  ResponseObjectPresignedURLModel,
  CreateListInsertResultModel,
  ResponseLargeListProcess,
} from '../../models';

describe('ListUploadController', () => {
  let controller: ListUploadController;
  let service: jest.Mocked<ListUploadService>;

  const mockListUploadService = {
    generatePreSignedUrl: jest.fn(),
    getObjectPreSignedUrl: jest.fn(),
    saveListToProcess: jest.fn(),
    startAnalysisProcessForList: jest.fn(),
    createListTables: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListUploadController],
      providers: [
        {
          provide: ListUploadService,
          useValue: mockListUploadService,
        },
      ],
    }).compile();

    controller = module.get<ListUploadController>(ListUploadController);
    service = module.get<ListUploadService>(ListUploadService) as jest.Mocked<ListUploadService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePreSignedUrl', () => {
    it('should generate presigned URL successfully', async () => {
      // Arrange
      const request: RequestPreSignedURLModel = {
        key: 'test-file.csv',
        contentType: 'text/csv',
        replaceFile: false,
      };

      const expectedResponse: ResponsePreSignedURLModel = {
        url: 'https://s3.amazonaws.com/bucket/presigned-url',
        keyFile: 'uuid-test-file.csv',
        fileS3Route: 's3://bucket/uuid-test-file.csv',
      };

      service.generatePreSignedUrl.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.generatePreSignedUrl(request);

      // Assert
      expect(service.generatePreSignedUrl).toHaveBeenCalledWith(
        request.key,
        request.contentType,
        request.replaceFile
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should generate presigned URL with replace file option', async () => {
      // Arrange
      const request: RequestPreSignedURLModel = {
        key: 'test-file.csv',
        contentType: 'text/csv',
        replaceFile: true,
      };

      const expectedResponse: ResponsePreSignedURLModel = {
        url: 'https://s3.amazonaws.com/bucket/presigned-url',
        keyFile: 'test-file.csv',
        fileS3Route: 's3://bucket/test-file.csv',
      };

      service.generatePreSignedUrl.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.generatePreSignedUrl(request);

      // Assert
      expect(service.generatePreSignedUrl).toHaveBeenCalledWith(
        request.key,
        request.contentType,
        true
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle different content types', async () => {
      // Arrange
      const request: RequestPreSignedURLModel = {
        key: 'test-file.geojson',
        contentType: 'application/geojson',
        replaceFile: false,
      };

      const expectedResponse: ResponsePreSignedURLModel = {
        url: 'https://s3.amazonaws.com/bucket/presigned-url',
        keyFile: 'uuid-test-file.geojson',
        fileS3Route: 's3://bucket/uuid-test-file.geojson',
      };

      service.generatePreSignedUrl.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.generatePreSignedUrl(request);

      // Assert
      expect(service.generatePreSignedUrl).toHaveBeenCalledWith(
        request.key,
        request.contentType,
        request.replaceFile
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate service errors', async () => {
      // Arrange
      const request: RequestPreSignedURLModel = {
        key: 'test-file.csv',
        contentType: 'text/csv',
        replaceFile: false,
      };

      const error = new Error('S3 service unavailable');
      service.generatePreSignedUrl.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.generatePreSignedUrl(request)).rejects.toThrow(error);
      expect(service.generatePreSignedUrl).toHaveBeenCalledWith(
        request.key,
        request.contentType,
        request.replaceFile
      );
    });
  });

  describe('getObjectPresignedURL', () => {
    it('should get object presigned URL successfully', async () => {
      // Arrange
      const request: GetObjectPresigned = {
        key: 'existing-file.csv',
      };

      const expectedResponse: ResponseObjectPresignedURLModel = {
        url: 'https://s3.amazonaws.com/bucket/download-url',
      };

      service.getObjectPreSignedUrl.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getObjectPresignedURL(request);

      // Assert
      expect(service.getObjectPreSignedUrl).toHaveBeenCalledWith(request.key);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle requests with replaceFile parameter', async () => {
      // Arrange
      const request: GetObjectPresigned = {
        key: 'existing-file.csv',
        replaceFile: true,
      };

      const expectedResponse: ResponseObjectPresignedURLModel = {
        url: 'https://s3.amazonaws.com/bucket/download-url',
      };

      service.getObjectPreSignedUrl.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getObjectPresignedURL(request);

      // Assert
      expect(service.getObjectPreSignedUrl).toHaveBeenCalledWith(request.key);
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate service errors', async () => {
      // Arrange
      const request: GetObjectPresigned = {
        key: 'non-existent-file.csv',
      };

      const error = new Error('File not found');
      service.getObjectPreSignedUrl.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getObjectPresignedURL(request)).rejects.toThrow(error);
      expect(service.getObjectPreSignedUrl).toHaveBeenCalledWith(request.key);
    });
  });

  describe('saveListToProcess', () => {
    it('should save list to process successfully', async () => {
      // Arrange
      const request: RequestSaveLargeListProcessModel = {
        key: 'test-file.csv',
        userId: 123,
        list_id: 456,
        listName: 'Test List',
        client_database: 'test_db',
      };

      const expectedResponse: CreateListInsertResultModel = {
        list_id: 456,
        s3_location: 's3://bucket/test-file.csv',
      };

      service.saveListToProcess.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.saveListToProcess(request);

      // Assert
      expect(service.saveListToProcess).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle database errors', async () => {
      // Arrange
      const request: RequestSaveLargeListProcessModel = {
        key: 'test-file.csv',
        userId: 123,
        list_id: 456,
        listName: 'Test List',
        client_database: 'test_db',
      };

      const error = new Error('Database connection failed');
      service.saveListToProcess.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.saveListToProcess(request)).rejects.toThrow(error);
      expect(service.saveListToProcess).toHaveBeenCalledWith(request);
    });
  });

  describe('processLargeList', () => {
    it('should process large list successfully', async () => {
      // Arrange
      const request: RequestLargeListProcess = {
        organization_id: 789,
        subscription_status_id: 1,
        organization_database: 'org_db',
        list_id: 456,
        path: 's3://bucket/test-file.csv',
        user_id: 123,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'soy',
      };

      const expectedResponse: ResponseLargeListProcess = {
        executionArn: 'arn:aws:states:us-east-1:123456789:execution:test:12345',
        startDate: '2023-01-01T00:00:00Z',
      };

      service.startAnalysisProcessForList.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.processLargeList(request);

      // Assert
      expect(service.startAnalysisProcessForList).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle optional parameters', async () => {
      // Arrange
      const request: RequestLargeListProcess = {
        organization_id: 789,
        subscription_status_id: 1,
        organization_database: 'org_db',
        list_id: 456,
        path: 's3://bucket/test-file.csv',
        user_id: 123,
        startAnalysis: false,
        isExternalAPIProcess: true,
        list_name: 'External List',
        analysisIds: ['analysis1', 'analysis2'],
        saveAsDraft: false,
        commodity: 'palm_oil',
      };

      const expectedResponse: ResponseLargeListProcess = {
        executionArn: 'arn:aws:states:us-east-1:123456789:execution:test:67890',
        startDate: '2023-01-01T12:00:00Z',
      };

      service.startAnalysisProcessForList.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.processLargeList(request);

      // Assert
      expect(service.startAnalysisProcessForList).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate step function errors', async () => {
      // Arrange
      const request: RequestLargeListProcess = {
        organization_id: 789,
        subscription_status_id: 1,
        organization_database: 'org_db',
        list_id: 456,
        path: 's3://bucket/test-file.csv',
        user_id: 123,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'soy',
      };

      const error = new Error('Step function execution failed');
      service.startAnalysisProcessForList.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.processLargeList(request)).rejects.toThrow(error);
      expect(service.startAnalysisProcessForList).toHaveBeenCalledWith(request);
    });
  });

  describe('triggerProcessLargeList', () => {
    it('should trigger process large list successfully', async () => {
      // Arrange
      const request: RequestTriggerProcessLargeList = {
        list_name: 'New List',
        user_id: 123,
        client_database: 'test_db',
        analysisIds: ['analysis1', 'analysis2', 'analysis3'],
        organization_id: 789,
        commodity: 'cocoa',
        saveAsDraft: false,
      };

      const expectedResponse = { list_id: 789 };

      service.createListTables.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.triggerProcessLargeList(request);

      // Assert
      expect(service.createListTables).toHaveBeenCalledWith({
        listName: request.list_name,
        userId: request.user_id,
        organization_id: request.organization_id,
        clientDatabase: request.client_database,
        analysisIds: request.analysisIds,
        commodity: request.commodity,
        saveAsDraft: request.saveAsDraft,
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should handle optional commodity parameter', async () => {
      // Arrange
      const request: RequestTriggerProcessLargeList = {
        list_name: 'New List Without Commodity',
        user_id: 456,
        client_database: 'test_db',
        analysisIds: ['analysis1'],
        organization_id: 789,
        saveAsDraft: true,
      };

      const expectedResponse = { list_id: 890 };

      service.createListTables.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.triggerProcessLargeList(request);

      // Assert
      expect(service.createListTables).toHaveBeenCalledWith({
        listName: request.list_name,
        userId: request.user_id,
        organization_id: request.organization_id,
        clientDatabase: request.client_database,
        analysisIds: request.analysisIds,
        commodity: undefined,
        saveAsDraft: request.saveAsDraft,
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should handle list creation errors', async () => {
      // Arrange
      const request: RequestTriggerProcessLargeList = {
        list_name: 'Failed List',
        user_id: 123,
        client_database: 'test_db',
        analysisIds: ['analysis1'],
        organization_id: 789,
        saveAsDraft: false,
      };

      const error = new Error('List creation failed');
      service.createListTables.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.triggerProcessLargeList(request)).rejects.toThrow(error);
      expect(service.createListTables).toHaveBeenCalledWith({
        listName: request.list_name,
        userId: request.user_id,
        organization_id: request.organization_id,
        clientDatabase: request.client_database,
        analysisIds: request.analysisIds,
        commodity: undefined,
        saveAsDraft: request.saveAsDraft,
      });
    });

    it('should handle multiple analysis IDs', async () => {
      // Arrange
      const request: RequestTriggerProcessLargeList = {
        list_name: 'Multi Analysis List',
        user_id: 123,
        client_database: 'test_db',
        analysisIds: ['deforestation', 'carbon', 'biodiversity', 'fire'],
        organization_id: 789,
        commodity: 'beef',
        saveAsDraft: false,
      };

      const expectedResponse = { list_id: 999 };

      service.createListTables.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.triggerProcessLargeList(request);

      // Assert
      expect(service.createListTables).toHaveBeenCalledWith({
        listName: request.list_name,
        userId: request.user_id,
        organization_id: request.organization_id,
        clientDatabase: request.client_database,
        analysisIds: request.analysisIds,
        commodity: request.commodity,
        saveAsDraft: request.saveAsDraft,
      });
      expect(result).toEqual(expectedResponse);
      expect(request.analysisIds).toHaveLength(4);
    });
  });

  describe('Controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should inject ListUploadService correctly', () => {
      expect(service).toBeDefined();
    });
  });

  describe('Error handling consistency', () => {
    it('should handle service unavailable scenarios consistently', async () => {
      // Arrange
      const serviceUnavailableError = new Error('Service temporarily unavailable');

      const preSignedRequest: RequestPreSignedURLModel = {
        key: 'test.csv',
        contentType: 'text/csv',
        replaceFile: false,
      };

      const getObjectRequest: GetObjectPresigned = { key: 'test.csv' };

      const saveListRequest: RequestSaveLargeListProcessModel = {
        key: 'test.csv',
        userId: 123,
        list_id: 456,
        listName: 'Test',
        client_database: 'test_db',
      };

      service.generatePreSignedUrl.mockRejectedValue(serviceUnavailableError);
      service.getObjectPreSignedUrl.mockRejectedValue(serviceUnavailableError);
      service.saveListToProcess.mockRejectedValue(serviceUnavailableError);

      // Act & Assert
      await expect(controller.generatePreSignedUrl(preSignedRequest)).rejects.toThrow(
        serviceUnavailableError
      );
      await expect(controller.getObjectPresignedURL(getObjectRequest)).rejects.toThrow(
        serviceUnavailableError
      );
      await expect(controller.saveListToProcess(saveListRequest)).rejects.toThrow(
        serviceUnavailableError
      );
    });
  });
});
