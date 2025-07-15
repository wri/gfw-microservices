import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ListUploadController } from './list-upload.controller';
import { SaveListToProcessService } from './save.list.to.process.service';
import { StartAnalysisService } from './start.analysis.service';
import { CreateLargeListService } from './create.large.list.service';
import { DeleteListService } from './delete.list.service';
import {
  RequestSaveLargeListProcessModel,
  RequestLargeListProcess,
  RequestTriggerProcessLargeList,
  DeleteListRequest,
} from '../../models';

describe('ListUploadController', () => {
  let controller: ListUploadController;
  let configService: jest.Mocked<ConfigService>;
  let saveListToProcessService: jest.Mocked<SaveListToProcessService>;
  let startAnalysisService: jest.Mocked<StartAnalysisService>;
  let createLargeListService: jest.Mocked<CreateLargeListService>;
  let deleteListService: jest.Mocked<DeleteListService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const mockSaveListToProcessService = {
      run: jest.fn(),
    };

    const mockStartAnalysisService = {
      run: jest.fn(),
    };

    const mockCreateLargeListService = {
      run: jest.fn(),
    };

    const mockDeleteListService = {
      run: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListUploadController],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: SaveListToProcessService,
          useValue: mockSaveListToProcessService,
        },
        {
          provide: StartAnalysisService,
          useValue: mockStartAnalysisService,
        },
        {
          provide: CreateLargeListService,
          useValue: mockCreateLargeListService,
        },
        {
          provide: DeleteListService,
          useValue: mockDeleteListService,
        },
      ],
    }).compile();

    controller = module.get<ListUploadController>(ListUploadController);
    configService = module.get(ConfigService);
    saveListToProcessService = module.get(SaveListToProcessService);
    startAnalysisService = module.get(StartAnalysisService);
    createLargeListService = module.get(CreateLargeListService);
    deleteListService = module.get(DeleteListService);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should initialize with all dependencies', () => {
      expect(controller['config']).toBeDefined();
      expect(controller['saveListToProcessService']).toBeDefined();
      expect(controller['startAnalysisService']).toBeDefined();
      expect(controller['createLargeListService']).toBeDefined();
      expect(controller['deleteListService']).toBeDefined();
    });
  });

  describe('saveListToProcess', () => {
    it('should call saveListToProcessService.run with correct parameters', async () => {
      const mockRequest: RequestSaveLargeListProcessModel = {
        key: 'test-key',
        userId: 123,
        list_id: 456,
        listName: 'Test List',
        client_database: 'test-db',
      };

      const mockResponse = { success: true };
      saveListToProcessService.run.mockResolvedValue(mockResponse);

      const result = await controller.saveListToProcess(mockRequest);

      expect(saveListToProcessService.run).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should return error when saveListToProcessService throws', async () => {
      const mockRequest: RequestSaveLargeListProcessModel = {
        key: 'test-key',
        userId: 123,
        list_id: 456,
        listName: 'Test List',
        client_database: 'test-db',
      };

      const mockError = new Error('Service error');
      saveListToProcessService.run.mockRejectedValue(mockError);

      await expect(controller.saveListToProcess(mockRequest)).rejects.toThrow('Service error');
    });
  });

  describe('processLargeList', () => {
    it('should process request and replace S3 bucket path', async () => {
      const bucketName = 'test-bucket';
      const mockRequest: RequestLargeListProcess = {
        organization_id: 123,
        subscription_status_id: 1,
        organization_database: 'test-db',
        list_id: 456,
        path: `s3://${bucketName}/folder/file.csv`,
        template_type: 'upload',
        user_id: 789,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'cocoa',
      };

      const mockResponse = {
        executionArn: 'arn:aws:states:us-east-1:123456789012:execution:test',
        startDate: '2023-01-01T00:00:00.000Z',
      };
      configService.get.mockReturnValue(bucketName);
      startAnalysisService.run.mockResolvedValue(mockResponse);

      const result = await controller.processLargeList(mockRequest);

      expect(configService.get).toHaveBeenCalledWith('LARGE_PROCESSING_LIST_BUCKET', {
        infer: true,
      });
      expect(mockRequest.path).toBe('folder/file.csv');
      expect(startAnalysisService.run).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should handle path without S3 bucket prefix', async () => {
      const bucketName = 'test-bucket';
      const mockRequest: RequestLargeListProcess = {
        organization_id: 123,
        subscription_status_id: 1,
        organization_database: 'test-db',
        list_id: 456,
        path: 'folder/file.csv',
        template_type: 'upload',
        user_id: 789,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'cocoa',
      };

      const mockResponse = {
        executionArn: 'arn:aws:states:us-east-1:123456789012:execution:test',
        startDate: '2023-01-01T00:00:00.000Z',
      };
      configService.get.mockReturnValue(bucketName);
      startAnalysisService.run.mockResolvedValue(mockResponse);

      const result = await controller.processLargeList(mockRequest);

      expect(mockRequest.path).toBe('folder/file.csv');
      expect(startAnalysisService.run).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty path', async () => {
      const bucketName = 'test-bucket';
      const mockRequest: RequestLargeListProcess = {
        organization_id: 123,
        subscription_status_id: 1,
        organization_database: 'test-db',
        list_id: 456,
        path: '',
        template_type: 'upload',
        user_id: 789,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'cocoa',
      };

      const mockResponse = {
        executionArn: 'arn:aws:states:us-east-1:123456789012:execution:test',
        startDate: '2023-01-01T00:00:00.000Z',
      };
      configService.get.mockReturnValue(bucketName);
      startAnalysisService.run.mockResolvedValue(mockResponse);

      const result = await controller.processLargeList(mockRequest);

      expect(mockRequest.path).toBe('');
      expect(startAnalysisService.run).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from startAnalysisService', async () => {
      const bucketName = 'test-bucket';
      const mockRequest: RequestLargeListProcess = {
        organization_id: 123,
        subscription_status_id: 1,
        organization_database: 'test-db',
        list_id: 456,
        path: 'folder/file.csv',
        template_type: 'upload',
        user_id: 789,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'cocoa',
      };

      const mockError = new Error('Analysis service error');
      configService.get.mockReturnValue(bucketName);
      startAnalysisService.run.mockRejectedValue(mockError);

      await expect(controller.processLargeList(mockRequest)).rejects.toThrow(
        'Analysis service error'
      );
    });
  });

  describe('triggerProcessLargeList', () => {
    it('should call createLargeListService with transformed parameters', async () => {
      const mockRequest: RequestTriggerProcessLargeList = {
        list_name: 'Test List',
        user_id: 123,
        organization_id: 456,
        client_database: 'test-db',
        analysisIds: ['analysis1', 'analysis2'],
        commodity: 'cocoa',
        saveAsDraft: false,
      };

      const mockResponse = { list_id: 789 };
      createLargeListService.run.mockResolvedValue(mockResponse);

      const result = await controller.triggerProcessLargeList(mockRequest);

      expect(createLargeListService.run).toHaveBeenCalledWith({
        listName: 'Test List',
        userId: 123,
        organization_id: 456,
        clientDatabase: 'test-db',
        analysisIds: ['analysis1', 'analysis2'],
        commodity: 'cocoa',
        saveAsDraft: false,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle optional commodity parameter', async () => {
      const mockRequest: RequestTriggerProcessLargeList = {
        list_name: 'Test List',
        user_id: 123,
        organization_id: 456,
        client_database: 'test-db',
        analysisIds: ['analysis1'],
        saveAsDraft: true,
      };

      const mockResponse = { list_id: 789 };
      createLargeListService.run.mockResolvedValue(mockResponse);

      const result = await controller.triggerProcessLargeList(mockRequest);

      expect(createLargeListService.run).toHaveBeenCalledWith({
        listName: 'Test List',
        userId: 123,
        organization_id: 456,
        clientDatabase: 'test-db',
        analysisIds: ['analysis1'],
        commodity: undefined,
        saveAsDraft: true,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from createLargeListService', async () => {
      const mockRequest: RequestTriggerProcessLargeList = {
        list_name: 'Test List',
        user_id: 123,
        organization_id: 456,
        client_database: 'test-db',
        analysisIds: ['analysis1'],
        saveAsDraft: false,
      };

      const mockError = new Error('Create list service error');
      createLargeListService.run.mockRejectedValue(mockError);

      await expect(controller.triggerProcessLargeList(mockRequest)).rejects.toThrow(
        'Create list service error'
      );
    });
  });

  describe('deleteList', () => {
    it('should call deleteListService with correct parameters', async () => {
      const listId = 123;
      const mockDeleteRequest: DeleteListRequest = {
        organization_user_id: 456,
        organizationDatabase: 'test-db',
        userEmail: 'test@example.com',
      };

      const mockResponse = 'List deleted successfully';
      deleteListService.run.mockResolvedValue(mockResponse);

      const result = await controller.deleteList(listId, mockDeleteRequest);

      expect(deleteListService.run).toHaveBeenCalledWith(
        listId,
        'test-db',
        456,
        'test@example.com'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle string listId parameter', async () => {
      const listId = 123;
      const mockDeleteRequest: DeleteListRequest = {
        organization_user_id: 789,
        organizationDatabase: 'prod-db',
        userEmail: 'admin@example.com',
      };

      const mockResponse = 'List deleted successfully';
      deleteListService.run.mockResolvedValue(mockResponse);

      const result = await controller.deleteList(listId, mockDeleteRequest);

      expect(deleteListService.run).toHaveBeenCalledWith(
        listId,
        'prod-db',
        789,
        'admin@example.com'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from deleteListService', async () => {
      const listId = 123;
      const mockDeleteRequest: DeleteListRequest = {
        organization_user_id: 456,
        organizationDatabase: 'test-db',
        userEmail: 'test@example.com',
      };

      const mockError = new Error('Delete service error');
      deleteListService.run.mockRejectedValue(mockError);

      await expect(controller.deleteList(listId, mockDeleteRequest)).rejects.toThrow(
        'Delete service error'
      );
    });
  });

  describe('dependency injection', () => {
    it('should have access to all injected services', () => {
      expect(controller['config']).toBe(configService);
      expect(controller['saveListToProcessService']).toBe(saveListToProcessService);
      expect(controller['startAnalysisService']).toBe(startAnalysisService);
      expect(controller['createLargeListService']).toBe(createLargeListService);
      expect(controller['deleteListService']).toBe(deleteListService);
    });
  });
});
