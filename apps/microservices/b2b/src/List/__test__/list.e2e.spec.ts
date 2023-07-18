import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpException } from '@nestjs/common';
import * as request from 'supertest';
import { ListController } from '../infrastructure/list.controller';
import { ListUseCases } from '../application/list.use-case';
import Result from '../../Shared/domain/result';

describe('ListController (e2e)', () => {
  let app: INestApplication;
  let listUseCases: ListUseCases;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ListController],
      providers: [ListUseCases],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    listUseCases = moduleFixture.get<ListUseCases>(ListUseCases);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get lists by filter', async () => {
    const orgId = 1;
    const searchListDto = { filters: [], orders: [], limit: 10, offset: 0 };
    const mockLists = [];

    jest
      .spyOn(listUseCases, 'findListsByFilters')
      .mockResolvedValueOnce(Result.ok(mockLists));

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${orgId}/lists?limit=${searchListDto.limit}&offset=${searchListDto.offset}`,
      )
      .expect(200);

    expect(response.body).toEqual(mockLists);
  });
});
