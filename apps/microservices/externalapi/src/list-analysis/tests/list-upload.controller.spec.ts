import { Test, TestingModule } from '@nestjs/testing';
import { ListUploadController } from '../list-upload.controller';
import {
  ListUploadNewRequest,
  ListUploadNewResponse,
  ListUploadNewErrorResponse,
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

describe('ListUploadController', () => {
  let controller: ListUploadController;
  let axiosMock;
  let userService: UserService;
  let organizationService: OrganizationService;

  beforeEach(async () => {
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
  });

  afterEach(() => {
    axiosMock.restore();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a successful response', async () => {
    const request: ListUploadNewRequest = {
      uploadId: '123',
      listName: 'Example List',
      templateId: '456',
      analysisIDs: '789',
    };

    const expectedResult: ListUploadNewResponse = {
      uploadId: '123',
      listId: 'generated-list-id',
      status: 'Completed',
      errorDetails: '',
      creationDate: '2023-09-21',
    };

    const result = await controller.uploadNewList(request);

    expect(result).toEqual(expectedResult);
  });

  it('should return an error response for invalid upload ID', async () => {
    const request: ListUploadNewRequest = {
      uploadId: 'invalid-id',
      listName: 'Example List',
      templateId: '456',
      analysisIDs: '789',
    };

    const expectedResult: ListUploadNewErrorResponse = {
      errorDetails: 'Failed to process the request',
    };

    try {
      await controller.uploadNewList(request);
    } catch (error) {
      expect(error.response).toEqual(expectedResult);
      expect(error.getStatus()).toBe(400); // Check if the status code is 400 Bad Request
    }
  });

  it('should return an error response for other error scenarios', async () => {
    const request: ListUploadNewRequest = {
      uploadId: 'another-invalid-id',
      listName: 'Example List',
      templateId: '456',
      analysisIDs: '789',
    };

    // Implement logic for other error scenarios

    const expectedResult: ListUploadNewErrorResponse = {
      errorDetails: 'Failed to process the request',
    };

    try {
      await controller.uploadNewList(request);
    } catch (error) {
      expect(error.response).toEqual(expectedResult);
      expect(error.getStatus()).toBe(400); // Check if the status code is 400 Bad Request
    }
  });

  it('should return a successful response for prepare upload', async () => {
    const actualDate = new Date();
    const axiosMockExpectedResponse = {
      url: 'mocked_url',
      keyFile: 'mocked_key',
      fileS3Route: 'mocked_s3_route',
    };

    const expectedResult = {
      uploadKeyFile: 'mocked_key',
      uploadUrl: 'mocked_url',
      userId: 123,
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
    axiosMock.onPost(/\/api\/create-presigned-url/).reply(200, axiosMockExpectedResponse);

    const request = {
      userEmail: 'test@test.com',
    };

    const result = await controller.prepareUploadList(request);

    const { uploadKeyFile, uploadUrl, userId } = result;

    expect({ uploadKeyFile, uploadUrl, userId }).toEqual(expectedResult);
  });
});
