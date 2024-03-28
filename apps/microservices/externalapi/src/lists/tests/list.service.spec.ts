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

describe('ListService', () => {
  let organizationService: OrganizationService;
  let module: TestingModule;
  let listService: ListService;
  let clientStoreConnection: ClientStoreConnection;

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
      ],
    }).compile();
  });

  beforeEach(async () => {
    organizationService = module.get<OrganizationService>(OrganizationService);
    listService = module.get<ListService>(ListService);
    clientStoreConnection = module.get<ClientStoreConnection>(ClientStoreConnection);
  });

  it('Should get List', async () => {
    const listId = 123;
    const organizationId = 1;
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
    const repositoryResult = {
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
      errorFileStoragePath: 's3://gfwpro-geotrellis-pre-data/error_file_storage_path',
      vectorTilesLastUpdated: new Date().toLocaleDateString('en-US'),
    };
    const expectedResult = {
      ...repositoryResult,
      errorFileStoragePath:
        'https://gfwpro-geotrellis-pre-data.s3.amazonaws.com/error_file_storage_path',
    };
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
        findOneBy: () => ({ ...repositoryResult }),
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
  it('Should not find List', async () => {
    const listId = 123;
    const organizationId = 1;

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
        findOneBy: () => null,
      }),
    });

    const result = await listService.getList({ organizationId, listId, analysisId: 'FCD' });
    expect(result).toEqual(null);
  });
});
