import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpException } from '@nestjs/common';
import * as request from 'supertest';
import { ListController } from '../infrastructure/list.controller';
import { ListUseCases } from '../application/list.use-case';

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
    const mockLists = [
      { id: 1, name: 'List 1' },
      { id: 2, name: 'List 2' },
    ];

    jest
      .spyOn(listUseCases, 'findListsByFilters')
      .mockResolvedValueOnce({ isSuccess: true, getValue: () => mockLists });

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${orgId}/lists?limit=${searchListDto.limit}&offset=${searchListDto.offset}`,
      )
      .expect(200);

    expect(response.body).toEqual(mockLists);
  });
});
