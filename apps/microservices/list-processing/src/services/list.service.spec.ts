import { ClientStoreConnection, FeatureFlag, Organization, SQLUtils } from '@wri-monorepos/sql';
import { RequestLargeListProcess, CreateListRequest } from '../models';
import { ListService } from './list.service';
import { StartAnalysisService } from '../app/list-upload/start.analysis.service';
import { DeprecatedStartAnalysisService } from '../app/list-upload/deprecated.start.analysis.service';
import { MetadataService } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { featureFlagsService } from '@wri-monorepos/shared';
import { DeprecatedCreateLargeListService } from '../app/list-upload/deprecated.create.large.list.service';
import { CreateLargeListService } from '../app/list-upload/create.large.list.service';
import { InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

jest.mock('@wri-monorepos/shared', () => ({
  featureFlagsService: jest.fn(),
}));

describe('ListService - Start Analysis Process For List', () => {
  let service: ListService;
  let startAnalysisService: StartAnalysisService;
  let deprecatedStartAnalysisService: DeprecatedStartAnalysisService;
  let createLargeListService: CreateLargeListService;
  let deprecatedCreateLargeListService: DeprecatedCreateLargeListService;
  let metadataServiceMock: Partial<MetadataService>;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    metadataServiceMock = {
      // Mock the methods you need from MetadataService
    };

    configServiceMock = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'LARGE_PROCESSING_LIST_BUCKET') {
          return 'test-bucket';
        }
        return undefined;
      }),
    };

    startAnalysisService = {
      run: jest.fn().mockResolvedValue({
        executionArn: 'test-arn',
        startDate: new Date().toISOString(),
      }),
    } as unknown as StartAnalysisService;

    deprecatedStartAnalysisService = {
      run: jest.fn().mockResolvedValue({
        executionArn: 'test-arn',
        startDate: new Date().toISOString(),
      }),
    } as unknown as DeprecatedStartAnalysisService;

    createLargeListService = {
      run: jest.fn(),
    } as unknown as CreateLargeListService;

    deprecatedCreateLargeListService = {
      run: jest.fn(),
    } as unknown as DeprecatedCreateLargeListService;

    service = new ListService(
      new ClientStoreConnection(),
      metadataServiceMock as MetadataService,
      configServiceMock as ConfigService,
      deprecatedStartAnalysisService,
      startAnalysisService,
      deprecatedCreateLargeListService,
      createLargeListService
    );
  });

  it('should call startAnalysisService.run if UploadListLp flag is true', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'org123',
      list_id: 1,
      path: 'test-path',
      template_type: 'test-type',
      user_id: 1,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'cocoa',
    };

    const flags: FeatureFlag[] = [
      {
        flagId: 'UploadListLp',
        flagState: true,
        id: 0,
        orgId: 0,
        modifierUserId: 0,
        updateDateTime: undefined,
        organization: new Organization(),
      },
      {
        flagId: 'AnotherFlag',
        flagState: false,
        id: 0,
        orgId: 0,
        modifierUserId: 0,
        updateDateTime: undefined,
        organization: new Organization(),
      },
    ];

    const mockFunc1 = jest.fn().mockReturnValue(flags);

    (featureFlagsService as jest.Mock).mockResolvedValue({
      getFeatureFlagsForCurrentOrg: mockFunc1,
    });

    await service.startAnalysisProcessForList(request);

    expect(startAnalysisService.run).toHaveBeenCalledWith(request);
    expect(deprecatedStartAnalysisService.run).not.toHaveBeenCalled();
  });

  it('should call deprecatedStartAnalysisService.run if UploadListLp flag is false', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'org123',
      list_id: 1,
      path: 'test-path',
      template_type: 'test-type',
      user_id: 1,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'cocoa',
    };

    const flags: FeatureFlag[] = [
      {
        flagId: 'UploadListLp',
        flagState: false,
        id: 0,
        orgId: 0,
        modifierUserId: 0,
        updateDateTime: undefined,
        organization: new Organization(),
      },
      {
        flagId: 'AnotherFlag',
        flagState: false,
        id: 0,
        orgId: 0,
        modifierUserId: 0,
        updateDateTime: undefined,
        organization: new Organization(),
      },
    ];

    const mockFunc1 = jest.fn().mockReturnValue(flags);

    (featureFlagsService as jest.Mock).mockResolvedValue({
      getFeatureFlagsForCurrentOrg: mockFunc1,
    });

    await service.startAnalysisProcessForList(request);

    expect(startAnalysisService.run).not.toHaveBeenCalledWith(request);
    expect(deprecatedStartAnalysisService.run).toHaveBeenCalled();
  });

  describe('startAnalysisProcessForList', () => {
    it('should replace S3 path prefix with empty string when UploadListLp flag is enabled', async () => {
      const request: RequestLargeListProcess = {
        organization_id: 1,
        subscription_status_id: 1,
        organization_database: 'test-database',
        list_id: 1,
        path: 's3://test-bucket/test-file.csv',
        template_type: 'test-type',
        user_id: 1,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'cocoa',
      };

      const mockFlags = [
        {
          flagId: 'UploadListLp',
          flagState: true,
        },
      ] as FeatureFlag[];

      (featureFlagsService as jest.Mock).mockResolvedValue({
        getFeatureFlagsForCurrentOrg: jest.fn().mockResolvedValue(mockFlags),
      });

      const result = await service.startAnalysisProcessForList(request);

      expect(configServiceMock.get).toHaveBeenCalledWith('LARGE_PROCESSING_LIST_BUCKET', {
        infer: true,
      });
      expect(request.path).toBe('test-file.csv');
      expect(startAnalysisService.run).toHaveBeenCalledWith(request);
      expect(result).toEqual({
        executionArn: 'test-arn',
        startDate: expect.any(String),
      });
    });

    it('should not modify path when UploadListLp flag is disabled', async () => {
      const request: RequestLargeListProcess = {
        organization_id: 1,
        subscription_status_id: 1,
        organization_database: 'test-database',
        list_id: 1,
        path: 's3://test-bucket/test-file.csv',
        template_type: 'test-type',
        user_id: 1,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'cocoa',
      };

      const mockFlags = [
        {
          flagId: 'UploadListLp',
          flagState: false,
        },
      ] as FeatureFlag[];

      (featureFlagsService as jest.Mock).mockResolvedValue({
        getFeatureFlagsForCurrentOrg: jest.fn().mockResolvedValue(mockFlags),
      });

      const result = await service.startAnalysisProcessForList(request);

      expect(request.path).toBe('s3://test-bucket/test-file.csv');
      expect(deprecatedStartAnalysisService.run).toHaveBeenCalledWith(request);
      expect(result).toEqual({
        executionArn: 'test-arn',
        startDate: expect.any(String),
      });
    });
  });
});

describe('ListService - Create New List', () => {
  let service: ListService;
  let createLargeListService: CreateLargeListService;
  let deprecatedCreateLargeListService: DeprecatedCreateLargeListService;
  let metadataServiceMock: Partial<MetadataService>;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    metadataServiceMock = {
      getMetadata: jest.fn().mockResolvedValue({ taskARN: 'test-task-arn' }),
    };

    configServiceMock = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'LARGE_PROCESSING_LIST_BUCKET') {
          return 'test-bucket';
        }
        return undefined;
      }),
    };

    createLargeListService = {
      run: jest.fn().mockResolvedValue({ list_id: 123 }),
    } as unknown as CreateLargeListService;

    deprecatedCreateLargeListService = {
      run: jest.fn().mockResolvedValue({ list_id: 123 }),
    } as unknown as DeprecatedCreateLargeListService;

    service = new ListService(
      new ClientStoreConnection(),
      metadataServiceMock as MetadataService,
      configServiceMock as ConfigService,
      {} as DeprecatedStartAnalysisService,
      {} as StartAnalysisService,
      deprecatedCreateLargeListService,
      createLargeListService
    );
  });

  it('should create a new list successfully', async () => {
    const createListRequest: CreateListRequest = {
      listName: 'test-list',
      userId: 1,
      clientDatabase: 'test-db',
      analysisIds: ['1', '2'],
      isUploadListLpEnabled: true,
      saveAsDraft: false,
      filename: 'test.csv',
      organization_id: 1,
    };

    const result = await service.createNewList(createListRequest);
    expect(result).toBeUndefined();
    expect(createLargeListService.run).toHaveBeenCalledWith(
      expect.objectContaining({
        listName: 'test-list',
        userId: 1,
        clientDatabase: 'test-db',
        analysisIds: ['1', '2'],
        isUploadListLpEnabled: true,
        saveAsDraft: false,
      })
    );
  }, 10100);

  it('should handle errors when creating a new list', async () => {
    const createListRequest: CreateListRequest = {
      listName: 'test-list',
      userId: 1,
      clientDatabase: 'test-db',
      analysisIds: ['1', '2'],
      isUploadListLpEnabled: true,
      saveAsDraft: false,
      filename: 'test.csv',
      organization_id: 1,
    };

    jest.spyOn(createLargeListService, 'run').mockRejectedValue(new Error('Test error'));

    const result = await service.createNewList(createListRequest);
    expect(result).toBeInstanceOf(InternalServerErrorException);
  });
});

describe('ListService - Create List Tables', () => {
  let service: ListService;
  let createLargeListService: CreateLargeListService;
  let deprecatedCreateLargeListService: DeprecatedCreateLargeListService;

  beforeEach(async () => {
    createLargeListService = {
      run: jest.fn().mockResolvedValue({ list_id: 123 }),
    } as unknown as CreateLargeListService;

    deprecatedCreateLargeListService = {
      run: jest.fn().mockResolvedValue({ list_id: 456 }),
    } as unknown as DeprecatedCreateLargeListService;

    service = new ListService(
      new ClientStoreConnection(),
      {} as MetadataService,
      {} as ConfigService,
      {} as DeprecatedStartAnalysisService,
      {} as StartAnalysisService,
      deprecatedCreateLargeListService,
      createLargeListService
    );
  });

  it('should use createLargeListService when isUploadListLpEnabled is true', async () => {
    const request = {
      listName: 'test-list',
      userId: 1,
      clientDatabase: 'test-db',
      analysisIds: ['1', '2'],
      isUploadListLpEnabled: true,
      saveAsDraft: false,
    };

    const result = await service.createListTables(request);
    expect(result).toEqual({ list_id: 123 });
    expect(createLargeListService.run).toHaveBeenCalledWith(request);
    expect(deprecatedCreateLargeListService.run).not.toHaveBeenCalled();
  });

  it('should use deprecatedCreateLargeListService when isUploadListLpEnabled is false', async () => {
    const request = {
      listName: 'test-list',
      userId: 1,
      clientDatabase: 'test-db',
      analysisIds: ['1', '2'],
      isUploadListLpEnabled: false,
      saveAsDraft: false,
    };

    const result = await service.createListTables(request);
    expect(result).toEqual({ list_id: 456 });
    expect(deprecatedCreateLargeListService.run).toHaveBeenCalledWith(request);
    expect(createLargeListService.run).not.toHaveBeenCalled();
  });
});

describe('ListService - Update Lists Upload Status', () => {
  let service: ListService;
  let clientStoreConnection: ClientStoreConnection;
  let metadataServiceMock: Partial<MetadataService>;

  beforeEach(async () => {
    metadataServiceMock = {
      getMetadata: jest.fn().mockResolvedValue({ taskARN: 'test-task-arn' }),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        save: jest.fn(),
      }),
    } as unknown as DataSource;

    clientStoreConnection = {
      getConnection: jest.fn().mockResolvedValue(mockDataSource),
    } as unknown as ClientStoreConnection;

    service = new ListService(
      clientStoreConnection,
      metadataServiceMock as MetadataService,
      {} as ConfigService,
      {} as DeprecatedStartAnalysisService,
      {} as StartAnalysisService,
      {} as DeprecatedCreateLargeListService,
      {} as CreateLargeListService
    );
  });

  it('should update existing record', async () => {
    const mockRepository = {
      findOne: jest.fn().mockResolvedValue({
        listId: 123,
        errorInfo: 'old error',
        lastSuccessfulStage: 'old stage',
        updateTime: new Date(),
        workerInstanceId: 'old-task',
      }),
      save: jest.fn(),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as unknown as DataSource;

    jest.spyOn(clientStoreConnection, 'getConnection').mockResolvedValue(mockDataSource);

    await service.updateListsUploadStatus('test-db', 123, 'new stage', 'new error');

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        listId: 123,
        errorInfo: 'new error',
        lastSuccessfulStage: 'new stage',
        workerInstanceId: 'test-task-arn',
      })
    );
  });

  it('should create new record if none exists', async () => {
    const mockRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as unknown as DataSource;

    jest.spyOn(clientStoreConnection, 'getConnection').mockResolvedValue(mockDataSource);

    await service.updateListsUploadStatus('test-db', 123, 'new stage', 'new error');

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        listId: 123,
        errorInfo: 'new error',
        lastSuccessfulStage: 'new stage',
        workerInstanceId: 'test-task-arn',
      })
    );
  });
});

describe('ListService - Save List To Process', () => {
  let service: ListService;
  let configServiceMock: Partial<ConfigService>;
  let metadataServiceMock: Partial<MetadataService>;

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'LARGE_PROCESSING_LIST_BUCKET') {
          return 'test-bucket';
        }
        return undefined;
      }),
    };

    metadataServiceMock = {
      getMetadata: jest.fn().mockResolvedValue({ taskARN: 'test-task-arn' }),
    };

    service = new ListService(
      new ClientStoreConnection(),
      metadataServiceMock as MetadataService,
      configServiceMock as ConfigService,
      {} as DeprecatedStartAnalysisService,
      {} as StartAnalysisService,
      {} as DeprecatedCreateLargeListService,
      {} as CreateLargeListService
    );
  });

  it('should save list to process successfully', async () => {
    const listDetails = {
      key: 'test-key',
      userId: 1,
      list_id: 123,
      listName: 'test-list',
      client_database: 'test-db',
    };

    jest.spyOn(SQLUtils, 'queryDB').mockResolvedValue({});

    const result = await service.saveListToProcess(listDetails);

    expect(result).toEqual({
      list_id: 123,
      s3_location: 's3://test-bucket/test-key',
    });
  });

  it('should handle errors when saving list to process', async () => {
    const listDetails = {
      key: 'test-key',
      userId: 1,
      list_id: 123,
      listName: 'test-list',
      client_database: 'test-db',
    };

    const testError = new Error('Test error');
    jest.spyOn(SQLUtils, 'queryDB').mockRejectedValue(testError);

    const result = await service.saveListToProcess(listDetails);

    expect(result).toBe(testError);
  });
});
