import { ClientStoreConnection, GHGAnalyses, Lists, SQLUtils } from '@wri-monorepos/sql';
import { GHGService } from './ghg.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as sinon from 'sinon';
import { GHGRepositoryMock } from './Repository/ghg.repository.mock';
import { ConfigModule } from '@nestjs/config';

describe('GHG - service', () => {
  let ghgService: GHGService;
  let clientStoreConnection: ClientStoreConnection;
  let module: TestingModule;

  beforeAll(async () => {
    sinon
      .stub(DataSource.prototype, 'getRepository')
      .withArgs(GHGAnalyses)
      .returns(new GHGRepositoryMock());

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [Lists],
        }),
        TypeOrmModule.forFeature([Lists], 'default'),
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      providers: [GHGService, ClientStoreConnection],
    }).compile();
  });

  beforeEach(() => {
    ghgService = module.get<GHGService>(GHGService);
    clientStoreConnection = module.get<ClientStoreConnection>(ClientStoreConnection);
    jest.clearAllMocks();
  });

  it(`Should return Number of Pages`, async () => {
    const mockCount = 5;
    clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
      getRepository: () => ({
        count: () => mockCount,
      }),
      options: {
        database: 'mock_db',
      },
    });

    const response = await ghgService.getNumberOfPagesGHGAnalysis(5692, {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 5,
    });
    expect(response).toEqual({
      pages: 2,
      clientDatabase: 'mockDatabase',
      rowsPerPage: 5,
    });
  });
  it(`Should not find Number of Pages for an inexistent id`, async () => {
    const mockCount = 0;
    clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
      getRepository: () => ({
        count: () => mockCount,
      }),
      options: {
        database: 'mock_db',
      },
    });
    const response = await ghgService.getNumberOfPagesGHGAnalysis(2, {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 5,
    });
    expect(response).toEqual({
      pages: 0,
      clientDatabase: 'mockDatabase',
      rowsPerPage: 1,
    });
  });
  it(`Should return GHG Data Per Page`, async () => {
    jest.spyOn(SQLUtils, 'queryDB').mockImplementation(() =>
      Promise.resolve([
        {
          listId: 1,
          listName: 'mockedListName',
          locationId: 2,
          totalAreaHa: 1.2921,
          statusCode: 2,
          locationError: null,
          commodity: 'SOYB',
          emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.3258}',
        },
        {
          listId: 1,
          listName: 'mockedListName',
          locationId: 3,
          totalAreaHa: 1.1921,
          statusCode: 2,
          locationError: null,
          commodity: 'SOYB',
          emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.4258}',
        },
      ])
    );

    const response = await ghgService.getGHGDataPerPage(1, {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 2,
      pageNumber: 0,
    });
    expect(response).toEqual([
      {
        listId: 1,
        listName: 'mockedListName',
        locationId: 2,
        totalAreaHa: 1.2921,
        statusCode: 2,
        locationError: null,
        commodity: 'SOYB',
        emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.3258}',
      },
      {
        listId: 1,
        listName: 'mockedListName',
        locationId: 3,
        totalAreaHa: 1.1921,
        statusCode: 2,
        locationError: null,
        commodity: 'SOYB',
        emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.4258}',
      },
    ]);
  });
  it(`Should not find GHG data for an inexistent ID`, async () => {
    jest.spyOn(SQLUtils, 'queryDB').mockImplementation(() => Promise.resolve([]));

    const response = await ghgService.getGHGDataPerPage(2, {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 2,
      pageNumber: 0,
    });
    expect(response).toEqual([]);
  });
});
