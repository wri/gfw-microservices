import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisService } from '../list-analysis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../api-keys/organization.entity';
import { ConfigModule } from '@nestjs/config';
import { ExternalAPIKey } from '../../api-keys/external-api-key.entity';
import { UserRoutes } from '../../api-keys/user-route.entity';
import { UserService } from '../user.service';
import { ClientStoreConnection } from '../../shared/client-store-connection';
import { OrganizationService } from '../organization.service';
import * as sinon from 'sinon';
import { DataSource } from 'typeorm';
import { ListsAnalysisStatus } from '../list-analysis-status.entity';
import { ListAnalysisStatusRepositoryMock } from './repositories/list-analysis-status.repository.mock';
import { ListAnalysisMessageModule } from '../../list-analysis-message-handler';
import { ListService } from '../../lists/lists.service';
import { Lists } from '../../lists/lists.entity';
import { S3Service } from '@wri-monorepos/aws';
import { NotFoundException } from '@nestjs/common';
import axios from 'axios';
describe('ListAnalysisService', () => {
  let service: ListAnalysisService;
  let organizationService: OrganizationService;
  let module: TestingModule;
  let clientStoreConnection: ClientStoreConnection;
  let userService: UserService;

  beforeAll(async () => {
    sinon
      .stub(DataSource.prototype, 'getRepository')
      .withArgs(ListsAnalysisStatus)
      .returns(new ListAnalysisStatusRepositoryMock());

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [Organization, UserRoutes, ExternalAPIKey, Lists],
        }),
        TypeOrmModule.forFeature([Organization, ExternalAPIKey, UserRoutes], 'default'),
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
        ListAnalysisMessageModule,
      ],
      providers: [
        ListAnalysisService,
        UserService,
        ClientStoreConnection,
        OrganizationService,
        ListService,
        S3Service,
      ],
    }).compile();
  });

  beforeEach(async () => {
    organizationService = module.get<OrganizationService>(OrganizationService);
    service = module.get<ListAnalysisService>(ListAnalysisService);
    userService = module.get<UserService>(UserService);
    clientStoreConnection = module.get<ClientStoreConnection>(ClientStoreConnection);
  });

  it('should delete a list', async () => {
    const listId = 123;
    const organizationId = 1;
    const userEmail = 'email@email.com';
    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      subscriptionStatusId: 1,
    });
    const mockList = {
      listId: 123,
      status: 'Completed',
      errorsDetails: [],
      resultUrl: 'https://example.com/results',
      creationDate: new Date('2023-09-28'),
      expirationDate: new Date('2023-09-28'),
    };
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        delete: () => true,
        findOne: () => mockList,
      }),
      options: {
        database: 'mock_db',
      },
    });

    userService.findUser = jest
      .fn()
      .mockResolvedValue({ id: 1, organization_user_id: 1, userEmail: userEmail });
    axios.post = jest.fn().mockResolvedValue({ status: 200 });
    const result = await service.deleteList(organizationId, listId, userEmail);
    expect(result).toEqual(true);
  });
  it('should not find a list to delete', async () => {
    const listId = 123;
    const organizationId = 1;
    const userEmail = 'email@email.com';

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      subscriptionStatusId: 1,
    });

    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        delete: () => true,
        findOne: () => null,
      }),
    });
    userService.findUser = jest
      .fn()
      .mockResolvedValue({ id: 1, organization_user_id: 1, userEmail: userEmail });
    axios.delete = jest.fn().mockResolvedValue({ status: 200 });
    await expect(service.deleteList(organizationId, listId, userEmail)).rejects.toThrowError(
      NotFoundException
    );
  });
  it('should throw error on trying to delete a list', async () => {
    const listId = 123;
    const organizationId = 1;
    const userEmail = 'email@email.com';

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      subscriptionStatusId: 1,
    });

    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: () => null,
      }),
    });
    await expect(service.deleteList(organizationId, listId, userEmail)).rejects.toThrowError(
      NotFoundException
    );
  });
  it('should create a prepare upload list', async () => {
    const organizationId = 1;
    const organization_user_id = 1;
    const fileType = 'csv';
    const expectedResult = {
      organizationId: organizationId.toString(),
      organization_user_id: organization_user_id.toString(),
      fileType,
    };
    service.prepareUpload = jest.fn().mockResolvedValue(expectedResult);
    const result = await service.prepareUpload({
      organizationId,
      organization_user_id,
      fileType,
    });

    expect(result).toEqual(expectedResult);
  });
  it('should get analysis status', async () => {
    const listId = 123;
    const organizationId = 1;
    const expectedResult = {
      listId: listId.toString(),
      status: 'Invalid Status',
      errorsDetails: [],
      resultUrl: 'https://example.com/results',
      creationDate: new Date().toLocaleDateString('en-US'),
      expirationDate: new Date('11-28-2999 02:00:22.895'),
    };
    const mockListsAnalysisStatus = {
      listId: listId.toString(),
      status: 'Completed',
      errorInfo: '',
      s3URL: 'https://example.com/results',
      updateTime: new Date().toLocaleDateString('en-US'),
      expirationTime: new Date('11-28-2999 02:00:22.895'),
    };
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: jest.fn().mockReturnValue(mockListsAnalysisStatus),
      }),
    });

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      subscriptionStatusId: 1,
    });

    const result = await service.getAnalysisStatus({ organizationId, listId, analysisId: 'FCD' });

    expect(result).toEqual(expectedResult);
  });
  it('should not return resultUrl, creationDate and expirationDate when the expirationDate is in the past', async () => {
    const listId = 123;
    const organizationId = 1;
    const expectedResult = {
      listId: listId.toString(),
      status: 'Invalid Status',
      errorsDetails: [],
      resultUrl: null,
      creationDate: null,
      expirationDate: null,
    };
    const mockListsAnalysisStatus = {
      listId: listId.toString(),
      status: 'Completed',
      errorInfo: '',
      s3URL: 'https://example.com/results',
      updateTime: new Date().toLocaleDateString('en-US'),
      expirationTime: new Date('11-28-2000 02:00:22.895'),
    };
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: jest.fn().mockReturnValue(mockListsAnalysisStatus),
      }),
    });

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      subscriptionStatusId: 1,
    });

    const result = await service.getAnalysisStatus({ organizationId, listId, analysisId: 'FCD' });
    expect(result).toEqual(expectedResult);
  });
  it('Should return inactive as error when errorDetails is empty', async () => {
    const listId = 123;
    const organizationId = 1;
    const expectedResult = {
      listId: listId.toString(),
      status: 'Error',
      errorsDetails: ['Inactive'],
      resultUrl: null,
      creationDate: null,
      expirationDate: null,
    };
    const mockListsAnalysisStatus = {
      listId: listId.toString(),
      status: 3,
      errorInfo: '',
      s3URL: null,
      updateTime: null,
      expirationTime: null,
    };
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: jest.fn().mockReturnValue(mockListsAnalysisStatus),
      }),
    });

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      subscriptionStatusId: 1,
    });

    const result = await service.getAnalysisStatus({ organizationId, listId, analysisId: 'FCD' });
    expect(result).toEqual(expectedResult);
  });
  it('Should not override status when status is inactive but errorDetails is not empty', async () => {
    const listId = 123;
    const organizationId = 1;
    const expectedResult = {
      listId: listId.toString(),
      status: 'Error',
      errorsDetails: ['Exceeded Analysis Limit'],
      resultUrl: null,
      creationDate: null,
      expirationDate: null,
    };
    const mockListsAnalysisStatus = {
      listId: listId.toString(),
      status: 3,
      errorInfo: 'Exceeded Analysis Limit',
      s3URL: null,
      updateTime: null,
      expirationTime: null,
    };
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: jest.fn().mockReturnValue(mockListsAnalysisStatus),
      }),
    });

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      subscriptionStatusId: 1,
    });

    const result = await service.getAnalysisStatus({ organizationId, listId, analysisId: 'FCD' });
    expect(result).toEqual(expectedResult);
  });
});
