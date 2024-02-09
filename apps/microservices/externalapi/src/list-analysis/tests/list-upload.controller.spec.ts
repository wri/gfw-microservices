import { Test, TestingModule } from '@nestjs/testing';
import { ListUploadController } from '../list-upload.controller';
import {
  ListUploadNewRequest,
  ListUploadNewResponse,
  PrepareUploadRequest,
} from '../list-upload-new.dto';
import { ListAnalysisService } from '../list-analysis.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalAPIKey } from '../../api-keys/external-api-key.entity';
import { Organization } from '../../api-keys/organization.entity';
import { UserRoutes } from '../../api-keys/user-route.entity';
import { UserService } from '../user.service';
import { ClientStoreConnection } from '../../shared/client-store-connection';
import { OrganizationService } from '../organization.service';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import { createRequest } from 'node-mocks-http';
import { Request } from 'node-fetch';
import * as sinon from 'sinon';
import { DataSource } from 'typeorm';
import { ExternalUpload } from '../external-upload.entity';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

jest.mock('@aws-sdk/client-s3', () => {
  const keyMap: { [key: string]: number } = {
    mock_key_123: 300,
    mock_key_1234: 299,
  };

  const mockS3Client = {
    send: async ({ Key }: { Key: string }) => {
      if (!keyMap[Key]) throw new Error('File not found');

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

  const requestMock = createRequest({
    method: 'GET',
    url: ``,
    headers: {
      'x-api-key': 'your-api-key',
    },
    user: {
      organizationId: 1,
    },
  }) as Request;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [Organization, ExternalAPIKey, UserRoutes],
        }),
        TypeOrmModule.forFeature([ExternalAPIKey, Organization, UserRoutes], 'default'),
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      controllers: [ListUploadController],
      providers: [ListAnalysisService, UserService, ClientStoreConnection, OrganizationService],
    }).compile();

    controller = module.get<ListUploadController>(ListUploadController);
    userService = module.get<UserService>(UserService);
    organizationService = module.get<OrganizationService>(OrganizationService);
    axiosMock = new AxiosMockAdapter(axios);

    sinon
      .stub(DataSource.prototype, 'getRepository')
      .withArgs(ExternalUpload)
      .returns(new ExternalUploadMockRepository());

    app = module.createNestApplication();
    await app.init();
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
      subscriptionStatusId: 1,
    });

    const request: ListUploadNewRequest = {
      uploadId: '123',
      listName: 'Example List',
      templateId: 456,
      analysisIDs: 'FCD',
    };

    const expectedResult = {
      uploadId: '123',
      listId: '123',
      status: 'Pending',
      errorDetails: '',
    };

    const result = await controller.uploadNewList(request, requestMock);
    const { listId, status, uploadId, errorDetails } = result as ListUploadNewResponse;
    expect({ listId, status, uploadId, errorDetails }).toEqual(expectedResult);
  });

  it('should return an error response when bucket file is empty', () => {
    const request: ListUploadNewRequest = {
      uploadId: '1234',
      listName: 'Example List',
      templateId: 456,
      analysisIDs: 'FCD',
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

    expect(controller.uploadNewList(request, requestMock)).rejects.toMatchObject(expectedError);
  });

  it('should return an error response when file does not exist', () => {
    const request: ListUploadNewRequest = {
      uploadId: '12345',
      listName: 'Example List',
      templateId: 456,
      analysisIDs: 'FCD',
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
      subscriptionStatusId: 1,
    });

    const expectedError = {
      message: 'Http Exception',
      name: 'HttpException',
      response: {
        errorDetails: 'File not found',
      },
      status: 403,
    };

    expect(controller.uploadNewList(request, requestMock)).rejects.toMatchObject(expectedError);
  });

  it('should return an error response when upload invalid ID', () => {
    const actualDate = new Date();
    const request: ListUploadNewRequest = {
      uploadId: '9999',
      listName: 'Example List',
      templateId: 456,
      analysisIDs: 'FCD',
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

    expect(controller.uploadNewList(request, requestMock)).rejects.toMatchObject(expectedError);
  });

  it('should return an error response for other error scenarios', () => {
    const actualDate = new Date();
    const request: ListUploadNewRequest = {
      uploadId: '999',
      listName: 'Example List',
      templateId: 456,
      analysisIDs: 'FCD',
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

  it.each(['AFI', 'RandomWrongType'])(
    'should return 400 if analysisIDs is not valid',
    async (analysisIds) => {
      const { statusCode } = await request(app.getHttpServer()).post('/v1/list/upload_new').send({
        uploadId: '999',
        listName: 'Example List',
        templateId: 456,
        analysisIds,
      });

      expect(statusCode).toBe(400);
    }
  );
});
