import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpException } from '@nestjs/common';
import * as request from 'supertest';
import { SharedListController } from '../infrastructure/shared-list.controller';
import { SharedListUseCases } from '../application/shared-list.use-case';
import { SharedList } from '../domain/shared-list.entity';
import { SearchDto } from '../../Shared/application/dtos/search.dto';
import { SearchResult } from '../../Shared/domain/types';
import {
  FilterType,
  OrderType,
  QueryCriteria,
} from '../../Shared/domain/criteria/query';
import { CreateSharedListDto } from '../application/dtos/create-shared-list.dto';

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
      orgTargetId: 0
    };
    const mockSharedList: SharedList = {
      id: 0,
      idConnectionRequest: 0,
      idList: 0,
      editedDate: undefined,
      sharedWithGeometry: false,
      enabled: false
    };

    jest.spyOn(sharedListUseCases, 'createSharedList').mockResolvedValueOnce({
      isSuccess: true,
      getValue: () => mockSharedList,
    });

    const response = await request(app.getHttpServer())
      .post(`/organizations/${orgId}/shared-lists`)
      .send(createSharedListDto)
      .expect(200);

    expect(response.body).toEqual(mockSharedList);
  });

  it('should search for shared lists', async () => {
    const searchDto: SearchDto = {
      filters: [],
      orders: [],
      limit: 10,
      offset: 0,
    };
    const mockSharedLists: SearchResult<SharedList> = {
      data: [
      ],
      total: 2,
    };

    jest.spyOn(sharedListUseCases, 'search').mockResolvedValueOnce({
      isSuccess: true,
      getValue: () => mockSharedLists,
    });

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${orgId}/shared-lists/search?limit=${searchDto.limit}&offset=${searchDto.offset}`,
      )
      .expect(200);

    expect(response.body).toEqual(mockSharedLists);
  });
});
