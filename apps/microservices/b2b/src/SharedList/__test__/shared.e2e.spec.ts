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

describe('SharedListController (e2e)', () => {
  let app: INestApplication;
  let sharedListUseCases: SharedListUseCases;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SharedListController],
      providers: [SharedListUseCases],
    }).compile();
    

    app = moduleFixture.createNestApplication();
    await app.init();

    sharedListUseCases =
      moduleFixture.get<SharedListUseCases>(SharedListUseCases);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a shared list', async () => {
    const orgId = 1;
    const createSharedListDto: CreateSharedListDto = {
      listId: 0,
      userEmail: '',
      orgTargetId: 0,
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
