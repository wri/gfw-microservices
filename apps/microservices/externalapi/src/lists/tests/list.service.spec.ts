import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../api-keys/organization.entity';
import { ConfigModule } from '@nestjs/config';
import { ExternalAPIKey } from '../../api-keys/external-api-key.entity';
import { UserRoutes } from '../../api-keys/user-route.entity';
import { ClientStoreConnection } from '../../shared/client-store-connection';
import * as sinon from 'sinon';
import { DataSource } from 'typeorm';
import { ListAnalysisMessageModule } from '../../list-analysis-message-handler';
import { ListService } from '../../lists/lists.service';
import { Lists } from '../../lists/lists.entity';
import { UserService } from '../../list-analysis/user.service';
import { OrganizationService } from '../../list-analysis/organization.service';
import { ListRepositoryMock } from './lists.repository.mock';
import { ListAnalysisService } from '../../list-analysis/list-analysis.service';
import { S3Service } from '@wri-monorepos/aws';
import { NotFoundException } from '@nestjs/common';

describe('ListService', () => {
  let organizationService: OrganizationService;
  let module: TestingModule;
  let listService: ListService;
  let clientStoreConnection: ClientStoreConnection;
  let s3Service: S3Service;
  const listId = 123;
  const expectedResult = {
    id: listId.toString(),
    userId: 10033,
    templateId: 5,
    listName: 'list name ',
    listTableName: 'list - table_name',
    listAnalysisTableName: 'analysis - ',
    listStatusId: 4,
    listErrorMessage: null,
    locationClassification: 'location_classification',
    customAttributeNames: null,
    customAttributeTypes: null,
    listLocationsCount: 1266,
    lockStatus: null,
    lockUserId: 1,
    associatedGfwlist: null,
    dashboardLastSubmit: new Date().toLocaleDateString('en-US'),
    dashboardLastResults: null,
    vectorTilesStoragePath: 'vector_tiles_storage_path',
    errorFileStoragePath: null,
    vectorTilesLastUpdated: new Date().toLocaleDateString('en-US'),
  };
  beforeAll(async () => {
    sinon
      .stub(DataSource.prototype, 'getRepository')
      .withArgs(Lists)
      .returns(new ListRepositoryMock());

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
    listService = module.get<ListService>(ListService);
    clientStoreConnection = module.get<ClientStoreConnection>(ClientStoreConnection);
    s3Service = module.get<S3Service>(S3Service);
  });

  it('Should get List', async () => {
    const organizationId = 1;

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
      subscriptionStatusId: 1,
    });
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOneBy: () => ({ ...expectedResult }),
      }),
    });

    const result = await listService.getList({ organizationId, listId, analysisId: 'FCD' });

    const resultWithDatesTransformed = {};
    for (const prop in result) {
      const value = result[prop];
      resultWithDatesTransformed[prop] =
        value instanceof Date ? value.toLocaleDateString('en-US') : value;
    }

    expect(resultWithDatesTransformed).toEqual(expectedResult);
  });

  it('Should get List and format errorFileStoragePath', async () => {
    const listId = 123;
    const organizationId = 1;
    const repositoryResult = expectedResult;
    repositoryResult['errorFileStoragePath'] =
      's3://bucketname/enviroment/status/erro_name.file_extension';

    const expectedResultWithErroPath = {
      ...repositoryResult,
      errorFileStoragePath: 's3://bucketname/enviroment/status/erro_name.file_extension',
    };
    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
      subscriptionStatusId: 1,
    });
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOneBy: () => ({ ...repositoryResult }),
      }),
    });
    s3Service.getFileSignedUrlDynamicEnvironment = jest
      .fn()
      .mockResolvedValue(expectedResult.errorFileStoragePath);
    const result = await listService.getList({ organizationId, listId, analysisId: 'FCD' });

    const resultWithDatesTransformed = {};
    for (const prop in result) {
      const value = result[prop];
      resultWithDatesTransformed[prop] =
        value instanceof Date ? value.toLocaleDateString('en-US') : value;
    }

    expect(resultWithDatesTransformed).toEqual(expectedResultWithErroPath);
  });
  it('Should not find List', async () => {
    const listId = 123;
    const organizationId = 1;

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
      subscriptionStatusId: 1,
    });
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOneBy: () => null,
      }),
    });

    const result = await listService.getList({ organizationId, listId, analysisId: 'FCD' });
    expect(result).toEqual(null);
  });
  it('Should get info from list', async () => {
    const organizationId = 1;
    const listInformationExpected = {
      listId: expectedResult.id,
      listName: expectedResult.listName,
      locationCount: expectedResult.listLocationsCount,
    };
    organizationService.findOrganizationById = jest.fn().mockResolvedValue(listInformationExpected);
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: () => ({ ...expectedResult }),
      }),
    });

    const result = await listService.getListInfo(organizationId, listId);

    const resultWithDatesTransformed = {};
    for (const prop in result) {
      const value = result[prop];
      resultWithDatesTransformed[prop] =
        value instanceof Date ? value.toLocaleDateString('en-US') : value;
    }

    expect(resultWithDatesTransformed).toEqual(listInformationExpected);
  });
  it('Should no found info list', async () => {
    const organizationId = 1;
    const listInformationExpected = {
      listId: expectedResult.id,
      listName: expectedResult.listName,
      locationCount: expectedResult.listLocationsCount,
    };
    organizationService.findOrganizationById = jest.fn().mockResolvedValue(listInformationExpected);
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: () => null,
      }),
    });

    await expect(listService.getListInfo(organizationId, listId)).rejects.toThrowError(
      NotFoundException
    );
  });
});
