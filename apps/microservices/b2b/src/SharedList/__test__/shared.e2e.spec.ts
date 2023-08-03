import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SharedListController } from '../infrastructure/shared-list.controller';
import { SharedListUseCases } from '../application/shared-list.use-case';
import { SharedList } from '../domain/shared-list.entity';
import { SearchDto } from '../../Shared/application/dtos/search.dto';
import { CreateSharedListDto } from '../application/dtos/create-shared-list.dto';
import Result from '../../Shared/domain/result';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockModule, HandlerParam } from '@wri-monorepos/shared';
import { DataSource, Repository } from 'typeorm';
import { Organization } from '../../Organization/domain/organization.entity';
import { SharedListModule } from '../shared-list.module';
import { RepositoryMssqlSP } from '../../Shared/infraestructure/mysql/repository.mysql';
import { List } from '../../List/domain/list.entity';
import { EmailService } from '@wri-monorepos/aws';
import { ActivityLog } from '../../ActivityLog/domain/activity-log';
import { ConnectionRepositorySqlite } from '../../Connection/__test__/connection.repository.sqlite';
import { ConnectionRepositorySP } from '../../Connection/domain/connection.repository.sp';
import { ConnectionRequest } from '../../Connection/domain/connection.entity';
import { UserUseCases } from '../../User/application/user.use-case';

describe('SharedListController (e2e)', () => {
  let app: INestApplication;
  let sharedListUseCases: SharedListUseCases;
  let AppDataSource: DataSource;

  let repoSharedList: Repository<SharedList>;
  let repoOrganization: Repository<Organization>;
  let repoList: Repository<List>;
  let repoConnectionSP: RepositoryMssqlSP;
  let repoConnection: Repository<ConnectionRequest>;
  const userUseCases = {
    checkUserIsListAdmin: jest.fn().mockReturnValue(Result.ok(true)),
  };

  let mockConnection1: ConnectionRequest;
  let mockConnectionCollection: ConnectionRequest[];
  let mockOrganization1: Organization;
  let mockOrganizationCollection: Organization[];
  let mockList1: List;
  let mockSharedLists: SharedList[];

  beforeAll(async () => {
    AppDataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [SharedList, ConnectionRequest, Organization, List],
      synchronize: true,
    });
    AppDataSource = await AppDataSource.initialize();

    repoSharedList = AppDataSource.getRepository(SharedList);
    repoOrganization = AppDataSource.getRepository(Organization);
    repoList = AppDataSource.getRepository(List);
    repoConnectionSP = new ConnectionRepositorySqlite(AppDataSource);
    repoConnection = AppDataSource.getRepository(ConnectionRequest);

    const handlers: HandlerParam[] = [
      {
        token: EmailService,
        callback: () => ({ sendEmail: jest.fn() }),
      },
      {
        token: ActivityLog,
        callback: () => ({ saveActivityLog: jest.fn() }),
      },
    ];

    const module = await createMockModule(
      {
        imports: [SharedListModule],
        controllers: [SharedListController],
      },
      handlers,
    )
      .overrideProvider(getRepositoryToken(SharedList))
      .useValue(repoSharedList)
      .overrideProvider(getRepositoryToken(ConnectionRequest))
      .useValue(repoConnection)
      .overrideProvider(ConnectionRepositorySP)
      .useValue(repoConnectionSP)
      .overrideProvider(getRepositoryToken(List))
      .useValue(repoList)
      .overrideProvider(getRepositoryToken(Organization))
      .useValue(repoOrganization)
      .overrideProvider(UserUseCases)
      .useValue(userUseCases)
      .compile();

    app = module.createNestApplication();
    await app.init();

    sharedListUseCases = module.get<SharedListUseCases>(SharedListUseCases);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);
    mockConnection1 = {
      id: 1,
      idSourceOrganization: 1,
      idTargetOrganization: 2,
      createDate: new Date(),
      sourceEmail: 'jose.quiroz.5@wriconsultant.org',
      initialTargetEmail: 'prosupertester1@gmail.com',
    };
    mockConnectionCollection = [
      mockConnection1,
      {
        id: 2,
        idSourceOrganization: 1,
        idTargetOrganization: 3,
        createDate: new Date(),
        sourceEmail: 'jose.quiroz.5@wriconsultant.org',
        initialTargetEmail: 'prosupertester1@gmail.com',
      },
    ];
    mockOrganization1 = {
      id: 1,
      organizationName: 'testOrg',
      organizationDb: 'testDB',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      subscriptionStatusId: 1,
    };
    mockOrganizationCollection = [
      mockOrganization1,
      {
        id: 2,
        organizationName: 'testOrg2',
        organizationDb: 'testDB2',
        organizationStatusId: 1,
        organizationActivatedTime: new Date(),
        subscriptionStatusId: 1,
      },
    ];
    mockList1 = {
      associatedGfwlist: 1,
      dashboardLastResults: new Date(),
      dashboardLastSubmit: new Date(),
      customAttributeNames: 'test',
      customAttributeTypes: 'test',
      errorFileStoragePath: null,
      id: 1,
      listAnalysisTableName: 'test',
      listErrorMessage: null,
      listLocationsCount: 0,
      listName: 'test',
      listStatusId: 1,
      locationClassification: 'test',
      lockStatus: 1,
      lockUserId: 1,
      templateId: 1,
      vectorTilesLastUpdated: new Date(),
      vectorTilesStoragePath: 'test',
      userId: 1,
      listTableName: 'list test 1',
    };

    mockSharedLists = [
      {
        id: 1,
        idConnectionRequest: 1,
        idList: 1,
        editedDate: new Date(),
        sharedWithGeometry: true,
        enabled: true,
      },
      {
        id: 2,
        idConnectionRequest: 2,
        idList: 2,
        editedDate: new Date(),
        sharedWithGeometry: true,
        enabled: true,
      },
    ];

    const promises: Promise<unknown>[] = [
      ...mockConnectionCollection.map((item) => repoConnection.save(item)),
      ...mockOrganizationCollection.map((item) => repoOrganization.save(item)),
      ...mockSharedLists.map((item) => repoSharedList.save(item)),
      repoList.save(mockList1),
    ];
    await Promise.allSettled(promises);
  });

  it('should create a shared list', async () => {
    const orgId = 1;
    const createSharedListDto: CreateSharedListDto = {
      listId: 1,
      userEmail: 'test@example.com',
      orgTargetId: 2,
    };

    jest.spyOn(sharedListUseCases, 'createSharedList');

    await request(app.getHttpServer())
      .post(`/organizations/${orgId}/shared-lists`)
      .send(createSharedListDto)
      .expect(201);
  });

  it('should search for shared lists', async () => {
    const orgId = 1;
    const searchDto: SearchDto = {
      filters: [],
      orders: [],
      limit: 10,
      offset: 0,
    };
    jest.spyOn(sharedListUseCases, 'search');

    await request(app.getHttpServer())
      .get(
        `/organizations/${orgId}/shared-lists/search?limit=${searchDto.limit}&offset=${searchDto.offset}`,
      )
      .expect(200);
  });
});
