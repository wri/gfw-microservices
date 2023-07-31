import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SharedListController } from '../infrastructure/shared-list.controller';
import { SharedListUseCases } from '../application/shared-list.use-case';
import { SharedList } from '../domain/shared-list.entity';
import { SearchDto } from '../../Shared/application/dtos/search.dto';
import { SearchResult } from '../../Shared/domain/types';
import { CreateSharedListDto } from '../application/dtos/create-shared-list.dto';
import Result from '../../Shared/domain/result';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockModule } from '@wri-monorepos/shared';
import { DataSource, Repository } from 'typeorm';
import { Organization } from '../../Organization/domain/organization.entity';
import { SharedListModule } from '../shared-list.module';
import { User } from '../../User/domain/user';
import { UserRepositoryMysql } from '../../User/infrastructure/user.repository.mssql';
import { RepositoryMssqlSP } from '../../Shared/infraestructure/mysql/repository.mysql';
import { UserRepository } from '../../User/domain/user.repository';
import { List } from '../../List/domain/list.entity';

describe('SharedListController (e2e)', () => {
  let app: INestApplication;
  let sharedListUseCases: SharedListUseCases;
  let AppDataSource: DataSource;
  let mockOrganization1: Organization;
  let mockOrganization2: Organization;
  let mockCollection: Organization[];

  let repoSharedList: Repository<SharedList>;
  let repoUser: RepositoryMssqlSP;
  let repoOrganization: Repository<Organization>;
  let repoList: Repository<List>;

  beforeAll(async () => {
    AppDataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [SharedList],
      synchronize: true,
    });
    AppDataSource = await AppDataSource.initialize();

    repoSharedList = AppDataSource.getRepository(SharedList);
    repoOrganization = AppDataSource.getRepository(Organization);
    repoList = AppDataSource.getRepository(List);
    repoUser = new UserRepositoryMysql(AppDataSource);

    const module = await createMockModule({
      imports: [SharedListModule],
      controllers: [SharedListController],
    })
      .overrideProvider(getRepositoryToken(SharedList))
      .useValue(repoSharedList)
      .overrideProvider(UserRepository)
      .useValue(repoUser)
      .overrideProvider(getRepositoryToken(List))
      .useValue(repoList)
      .overrideProvider(getRepositoryToken(Organization))
      .useValue(repoOrganization)
      .compile();

    app = module.createNestApplication();
    await app.init();

    sharedListUseCases = module.get<SharedListUseCases>(SharedListUseCases);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    
  });

  it('should create a shared list', async () => {
    const orgId = 1;
    const createSharedListDto: CreateSharedListDto = {
      listId: 1,
      userEmail: 'test@example.com',
      orgTargetId: 1,
    };
    const mockSharedList: SharedList = {
      id: 0,
      idConnectionRequest: 0,
      idList: 0,
      editedDate: undefined,
      sharedWithGeometry: false,
      enabled: false,
    };

    jest
      .spyOn(sharedListUseCases, 'createSharedList')
      .mockResolvedValueOnce(Result.ok(mockSharedList));

    const response = await request(app.getHttpServer())
      .post(`/organizations/${orgId}/shared-lists`)
      .send(createSharedListDto)
      .expect(200);

    expect(response.body).toEqual(mockSharedList);
  });

  it('should search for shared lists', async () => {
    const orgId = 1;
    const searchDto: SearchDto = {
      filters: [],
      orders: [],
      limit: 10,
      offset: 0,
    };
    const mockSharedLists: SearchResult<SharedList> = {
      count: 0,
      offset: 0,
      limit: 0,
      items: [],
    };

    jest
      .spyOn(sharedListUseCases, 'search')
      .mockResolvedValueOnce(Result.ok(mockSharedLists));

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${orgId}/shared-lists/search?limit=${searchDto.limit}&offset=${searchDto.offset}`,
      )
      .expect(200);

    expect(response.body).toEqual(mockSharedLists);
  });
});
