import { ClientStoreConnection, GHGAnalyses, Lists } from '@wri-monorepos/sql';
import { GHGService } from './ghg.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as sinon from 'sinon';

describe('GHG - service', () => {
  let ghgService: GHGService;
  let clientStoreConnection: ClientStoreConnection;
  let module: TestingModule;

  beforeAll(async () => {
    sinon.stub(DataSource.prototype, 'getRepository').withArgs(GHGAnalyses).returns();

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
    const listId = 5692;
    clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
      getRepository: () => ({
        count: () => mockCount,
      }),
      options: {
        database: 'mock_db',
      },
    });

    const response = await ghgService.getNumberOfPagesGHGAnalysis(listId, {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 5,
    });
    expect(response).toEqual({
      id: listId,
      quantity: 5,
    });
  });
  it(`Should not find Number of Pages for an inexistent id`, async () => {
    const mockCount = 0;
    const listId = 2;
    clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
      getRepository: () => ({
        count: () => mockCount,
      }),
      options: {
        database: 'mock_db',
      },
    });
    const response = await ghgService.getNumberOfPagesGHGAnalysis(listId, {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 5,
    });
    expect(response).toEqual({
      id: listId,
      quantity: 0,
    });
  });

  it(`Should return GHG Data Per Page`, async () => {
    const mockData = [
      {
        listId: 1,
        listName: 'mockedListName',
        locationId: 2,
        totalAreaHa: 1.2921,
        statusCode: 2,
        locationError: null,
        commodity: 'COCOA',
        emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.3258}',
        efCo2ByYear: '{}',
        efCh4ByYear: '{}',
        efN2oByYear: '{}',
      },
      {
        listId: 1,
        listName: 'mockedListName',
        locationId: 3,
        totalAreaHa: 1.1921,
        statusCode: 2,
        locationError: null,
        commodity: 'COCOA',
        emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.4258}',
        efCo2ByYear: '{}',
        efCh4ByYear: '{}',
        efN2oByYear: '{}',
      },
    ];
    const listId = 1;
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findAndCount: () => [mockData, mockData.length],
        findOne: () => ({ listName: 'mockedListName', Commodity: 'COCOA' }),
        find: () => [
          { locationName: 'Brazil1', locationId: 1 },
          { locationName: 'brazil2', locationId: 2 },
          { locationName: 'arg3 landmark', locationId: 3 },
          { locationName: 'arg4 wdpa', locationId: 4 },
        ],
      }),
      options: {
        database: 'mock_db',
      },
    });
    const response = await ghgService.getGHGDataPerPage(listId, {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 2,
      pageNumber: 0,
    });
    expect(response).toEqual([
      {
        listId: listId,
        listName: 'mockedListName',
        locationName: 'brazil2',
        totalAreaHa: 1.2921,
        statusCode: 2,
        locationError: null,
        commodity: 'COCOA',
        combinedEmissionsFactor: '{"2021":0.5839,"2022":0.1825,"2023":0.3258}',
        ch4EmissionsFactor: '{}',
        co2EmissionsFactor: '{}',
        n2oEmissionsFactor: '{}',
      },
      {
        listId: 1,
        listName: 'mockedListName',
        locationName: 'arg3 landmark',
        totalAreaHa: 1.1921,
        statusCode: 2,
        locationError: null,
        commodity: 'COCOA',
        combinedEmissionsFactor: '{"2021":0.5839,"2022":0.1825,"2023":0.4258}',
        ch4EmissionsFactor: '{}',
        co2EmissionsFactor: '{}',
        n2oEmissionsFactor: '{}',
      },
    ]);
  });
  it(`Should not find GHG data for an inexistent ID`, async () => {
    const listId = 2;
    clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
      getRepository: () => ({
        findAndCount: () => [[], 0],
        findOne: () => ({ listName: 'mockedListName', Commodity: 'COCOA' }),
      }),
      options: {
        database: 'mock_db',
      },
    });
    const response = await ghgService.getGHGDataPerPage(listId, {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 2,
      pageNumber: 0,
    });
    expect(response).toEqual([]);
  });
});
