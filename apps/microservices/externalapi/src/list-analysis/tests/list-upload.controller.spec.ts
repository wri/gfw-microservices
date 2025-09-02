import { Test, TestingModule } from '@nestjs/testing';
import { ListUploadController } from '../list-upload.controller';
import {
  ListUploadNewRequest,
  ListUploadNewResponse,
  PrepareUploadRequest,
} from '../list-upload-new.dto';
import { ListAnalysisService } from '../list-analysis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user.service';
import { OrganizationService } from '../organization.service';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import { createRequest } from 'node-mocks-http';
import { Request } from 'express';
import * as sinon from 'sinon';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ListAnalysisMessageModule } from '../../list-analysis-message-handler';
import { SqsService, SqsModule, SqsMessageHandler } from '@ssut/nestjs-sqs';
import { ListService } from '../../lists/lists.service';
import { S3Service } from '@wri-monorepos/aws';
//import { } from '@ssut/nestjs-sqs';
import { SaveActivityLogEndpoint } from '../utils/saveActivityLogEndpoint';
import {
  ClientStoreConnection,
  ExternalAPIKey,
  ExternalUpload,
  FeatureFlag,
  Organization,
  UserRoutes,
} from '@wri-monorepos/sql';

// Mock ConfigService
const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'AWS_ANALYSIS_QUEUE' || key === 'AWS_DOWNLOAD_QUEUE') {
      return 'https://sqs.us-west-2.amazonaws.com/123456789012/MyQueue';
    }
    if (key === 'AWS_REGION') {
      return 'us-west-2';
    }
    if (key === 'NODE_ENV') {
      return 'test';
    }
  }),
};

jest.mock('@aws-sdk/client-s3', () => {
  const keyMap: { [key: string]: number } = {
    mock_key_123: 300,
    mock_key_1234: 299,
  };

  const mockS3Client = {
    send: async ({ Key }: { Key: string }) => {
      if (!keyMap[Key]) {
        throw new Error('File not found');
      }

      return { ContentLength: keyMap[Key] };
    },
  };

  return {
    S3Client: jest.fn().mockImplementation(() => mockS3Client),
    GetObjectCommand: jest.fn().mockImplementation((params) => ({
      Bucket: params.Bucket,
      Key: params.Key,
    })),
  };
});

// Mock SQS consumer so it doesn't try receiving messages
jest.mock('sqs-consumer', () => {
  return {
    Consumer: {
      create: jest.fn().mockImplementation(() => ({
        start: jest.fn(),
      })),
    },
  };
});

interface WhereRequest {
  where: {
    id: number;
  };
}

class ExternalUploadMockRepository {
  findOne = jest.fn(async (where: WhereRequest) => {
    const records = [
      {
        id: 123,
        userId: 123,
        uploadKeyFile: 'mock_key_123',
        uploadUrl: 'mock_url',
        uploadDateTime: new Date().toLocaleDateString(),
      },
      {
        id: 1234,
        userId: 1234,
        uploadKeyFile: 'mock_key_1234',
        uploadUrl: 'mock_url',
        uploadDateTime: new Date().toLocaleDateString(),
      },
      {
        id: 12345,
        userId: 1234,
        uploadKeyFile: 'mock_key_12345',
        uploadUrl: 'mock_url',
        uploadDateTime: new Date().toLocaleDateString(),
      },
    ];

    return records.find((record) => record.id === where.where.id);
  });

  save = jest.fn(async () => ({
    id: 123,
    uploadDateTime: new Date().toLocaleDateString(),
    uploadUrl: 'mocked_url',
  }));
}

describe('ListUploadController', () => {
  let controller: ListUploadController;
  let axiosMock;
  let userService: UserService;
  let organizationService: OrganizationService;
  let app: INestApplication;
  let listAnalysisService: ListAnalysisService;

  const requestMock = createRequest({
    method: 'GET',
    url: ``,
    headers: {
      'x-api-key': 'your-api-key',
    },
  }) as Request;

  requestMock.user = {
    organizationId: 1,
    organization_user_id: 1,
    hasValidEmail: true,
  };

  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: false,
          entities: [Organization, ExternalAPIKey, UserRoutes, FeatureFlag],
        }),
        TypeOrmModule.forFeature(
          [ExternalAPIKey, Organization, UserRoutes, FeatureFlag],
          'default'
        ),
        ListAnalysisMessageModule,
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      controllers: [ListUploadController],
      providers: [
        ListAnalysisService,
        UserService,
        {
          provide: ClientStoreConnection,
          useValue: {
            getConnection: jest.fn().mockResolvedValue({
              getRepository: () => ({
                findOne: () => true,
                save: () => true,
              }),
              options: {
                database: 'mock_db',
              },
            }),
          },
        },
        OrganizationService,
        ListService,
        S3Service,
        {
          provide: SaveActivityLogEndpoint,
          useValue: {
            saveActivityLogEndpoint: jest.fn(() => true),
          },
        },
        ConfigService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService) // Use the mock ConfigService
      .compile();

    controller = module.get<ListUploadController>(ListUploadController);
    userService = module.get<UserService>(UserService);
    organizationService = module.get<OrganizationService>(OrganizationService);
    axiosMock = new AxiosMockAdapter(axios);
    listAnalysisService = module.get<ListAnalysisService>(ListAnalysisService);
    const dataSourceStub = sinon.stub(DataSource.prototype, 'getRepository');
    dataSourceStub.withArgs(ExternalUpload).returns(new ExternalUploadMockRepository() as any);
    // For other entities, return a basic mock repository
    dataSourceStub.returns({
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      create: jest.fn(),
    } as any);

    // Mock SqsService methods to prevent cleanup errors
    sinon.stub(SqsService.prototype, 'send').returns({
      register: jest.fn(),
    });
    sinon.stub(SqsService.prototype, 'onModuleDestroy').returns(undefined);
    sinon.stub(SqsModule, 'registerAsync').returns({
      register: jest.fn(),
    });

    sinon.stub(SqsMessageHandler);

    app = module.createNestApplication();
    await app.init();

    // Get the DataSource for cleanup
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    // Clean up database connections
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    if (app) {
      await app.close();
    }
    // Restore all stubs
    sinon.restore();
  });

  it('should return a successful response', async () => {
    const createLargeListMockExpectedResponse = {
      list_id: 123,
    };

    const saveListToProcessMockExpectedResponse = {
      list_id: 123,
      s3_location: 's3://test-bucket/test.csv',
    };

    const executeListAnalysisMockExpectedResponse = {
      executionArn: 'abc:123',
      startDate: new Date(),
    };

    axiosMock.onPost(/\/api\/create-large-list/).reply(200, createLargeListMockExpectedResponse);
    axiosMock
      .onPost(/\/api\/save-list-to-process/)
      .reply(200, saveListToProcessMockExpectedResponse);
    axiosMock.onPost(/\/api\/process-list/).reply(200, executeListAnalysisMockExpectedResponse);

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
      subscriptionStatusId: 1,
    });

    const request: ListUploadNewRequest = {
      uploadId: '123',
      listName: 'Example List',
      analysisIDs: 'FCD',
      commodity: 'Cocoa Generic',
    };

    const expectedResult = {
      uploadId: '123',
      listId: '123',
      status: 'Pending',
      errorDetails: '',
    };
    listAnalysisService.uploadNewList = jest.fn().mockResolvedValue(expectedResult);
    const result = await controller.uploadNewList(request, requestMock);
    const { listId, status, uploadId, errorDetails } = result as ListUploadNewResponse;
    expect({ listId, status, uploadId, errorDetails }).toEqual(expectedResult);
  });

  it('should return an error response when bucket file is empty', () => {
    const request: ListUploadNewRequest = {
      uploadId: '1234',
      listName: 'Example List',
      analysisIDs: 'FCD',
      commodity: 'Cocoa Generic',
    };

    // Mock user response to let process continue
    userService.findUser = jest.fn().mockResolvedValue({
      id: 123,
      user_email: 'test@test.com',
      organization_id: 1,
      organization_user_id: 1,
      organization_user_status_id: 1,
      tokens: [],
    });

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
      subscriptionStatusId: 1,
    });

    const expectedError = {
      message: 'Http Exception',
      name: 'HttpException',
      response: {
        errorDetails: 'File is empty',
      },
      status: 403,
    };
    listAnalysisService.uploadNewList = jest.fn().mockRejectedValue(expectedError);
    expect(controller.uploadNewList(request, requestMock)).rejects.toMatchObject(expectedError);
  });

  it('should return an error response when file does not exist', () => {
    const request: ListUploadNewRequest = {
      uploadId: '12345',
      listName: 'Example List',
      analysisIDs: 'FCD',
      commodity: 'Cocoa Generic',
    };

    // Mock user response to let process continue
    userService.findUser = jest.fn().mockResolvedValue({
      id: 123,
      user_email: 'test@test.com',
      organization_id: 1,
      organization_user_id: 1,
      organization_user_status_id: 1,
      tokens: [],
    });
    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
      subscriptionStatusId: 1,
    });

    const expectedError = {
      message: 'Http Exception',
      name: 'HttpException',
      response: {
        errorDetails: 'File not found',
      },
      status: 404,
    };
    listAnalysisService.uploadNewList = jest.fn().mockRejectedValue(expectedError);
    expect(controller.uploadNewList(request, requestMock)).rejects.toMatchObject(expectedError);
  });

  it('should return an error response when upload invalid ID', () => {
    const actualDate = new Date();
    const request: ListUploadNewRequest = {
      uploadId: '9999',
      listName: 'Example List',
      analysisIDs: 'FCD',
      commodity: 'Cocoa Generic',
    };

    // Mock user response to let process continue
    userService.findUser = jest.fn().mockResolvedValue({
      id: 123,
      user_email: 'test@test.com',
      organization_id: 1,
      organization_user_id: 1,
      organization_user_status_id: 1,
      tokens: [],
    });

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: actualDate,
      renewalTime: actualDate,
      subscriptionStatusId: 1,
    });

    const expectedError = {
      message: 'Http Exception',
      name: 'HttpException',
      response: {
        errorDetails: 'Failed to process the request, upload id not found',
      },
      status: 400,
    };
    listAnalysisService.uploadNewList = jest.fn().mockRejectedValue(expectedError);
    expect(controller.uploadNewList(request, requestMock)).rejects.toMatchObject(expectedError);
  });

  it('should return an error response for other error scenarios', () => {
    const actualDate = new Date();
    const request: ListUploadNewRequest = {
      uploadId: '999',
      listName: 'Example List',
      analysisIDs: 'FCD',
      commodity: 'Cocoa Generic',
    };

    // Mock user response to let process continue
    userService.findUser = jest.fn().mockResolvedValue({
      id: 123,
      user_email: 'test@test.com',
      organization_id: 1,
      organization_user_id: 1,
      organization_user_status_id: 1,
      tokens: [],
    });

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: actualDate,
      renewalTime: actualDate,
      subscriptionStatusId: 1,
    });

    const expectedError = {
      message: 'Http Exception',
      name: 'HttpException',
      response: {
        errorDetails: 'Failed to process the request, upload id not found',
      },
      status: 400,
    };
    listAnalysisService.uploadNewList = jest.fn().mockRejectedValue(expectedError);
    expect(controller.uploadNewList(request, requestMock)).rejects.toMatchObject(expectedError);
  });

  it('should return a successful response for prepare upload', () => {
    const actualDate = new Date();
    const preSignURLMockExpectedResponse = {
      url: 'mocked_url',
      keyFile: 'mocked_key',
      fileS3Route: 'mocked_s3_route',
    };

    // Mock user response to let process continue
    userService.findUser = jest.fn().mockResolvedValue({
      id: 123,
      user_email: 'test@test.com',
      organization_id: 1,
      organization_user_id: 1,
      organization_user_status_id: 1,
      tokens: [],
    });

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: actualDate,
      renewalTime: actualDate,
      subscriptionStatusId: 1,
    });

    // Mock the Axios request and specify the response
    axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPost(/\/api\/create-presigned-url/).reply(200, preSignURLMockExpectedResponse);

    const requestBody: PrepareUploadRequest = {
      userEmail: 'test@test.com',
      fileType: 'csv',
    };

    const expectedResult = {
      uploadDateTime: new Date().toLocaleDateString(),
      uploadId: '123',
      uploadUrl: 'mocked_url',
    };
    expect(controller.prepareUploadList(requestBody, requestMock)).resolves.toEqual(expectedResult);
  });

  it('should return 400 when list name already exists', async () => {
    axiosMock.onPost(/\/api\/create-large-list/).reply(400, {
      message: 'List name already exists',
    });

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
      subscriptionStatusId: 1,
    });

    const request: ListUploadNewRequest = {
      uploadId: '123',
      listName: 'List name duplicated',
      analysisIDs: 'FCD',
      commodity: 'Cocoa Generic',
    };

    const expectedError = {
      message: 'Http Exception',
      name: 'HttpException',
      status: 400,
      response: { errorDetails: 'List name already exists' },
    };
    listAnalysisService.uploadNewList = jest.fn().mockRejectedValue(expectedError);
    expect(controller.uploadNewList(request, requestMock)).rejects.toMatchObject(expectedError);
  });

  it.each(['AFI', 'RandomWrongType'])(
    'should return 400 if analysisIDs is not valid',
    async (analysisIds) => {
      const expectedError = {
        message: 'Http Exception',
        name: 'HttpException',
        status: 400,
        response: { errorDetails: 'List name already exists' },
      };
      listAnalysisService.uploadNewList = jest.fn().mockRejectedValue(expectedError);
      const { statusCode } = await request(app.getHttpServer()).post('/v1/list/upload_new').send({
        uploadId: '999',
        listName: 'Example List',
        analysisIds,
      });
      expect(statusCode).toBe(400);
    }
  );

  it('should return 400 when LP returns 500 with duplicate name message', async () => {
    axiosMock.onPost(/\/api\/create-large-list/).reply(500, {
      message: 'List name already exists',
    });

    // No need to mock save-list-to-process or process-list since create-large-list fails first

    userService.findUser = jest.fn().mockResolvedValue({
      id: 123,
      user_email: 'test@test.com',
      organization_id: 1,
      organization_user_id: 1,
      organization_user_status_id: 1,
      tokens: [],
    });

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
      subscriptionStatusId: 1,
    });

    const requestBody = {
      uploadId: '123',
      listName: 'Duplicate Name',
      analysisIDs: 'FCD',
      commodity: 'Cocoa Generic',
    };

    await expect(controller.uploadNewList(requestBody, requestMock)).rejects.toMatchObject({
      status: 400,
      response: { errorDetails: 'List name already exists' },
    });
  });
});
