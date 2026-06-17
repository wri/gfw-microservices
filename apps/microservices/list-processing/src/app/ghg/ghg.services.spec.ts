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

  const buildConnectionMock = (rawRows: unknown[], list = {}) => {
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(rawRows),
    };
    const getConnection = jest.fn().mockResolvedValue({
      getRepository: (entity: unknown) =>
        entity === Lists
          ? {
              findOne: () => ({
                listName: 'mockedListName',
                listTableName: 'mock_list_table',
                Commodity: 'COCOA',
                ...list,
              }),
            }
          : { createQueryBuilder: () => queryBuilder },
      options: { database: 'mock_db' },
    });
    return { getConnection, queryBuilder };
  };

  it(`Should return GHG Data Per Page`, async () => {
    const rawRows = [
      {
        listId: 1,
        country: 'Mock Country',
        state: 'Mock State',
        subState: 'Mock SubState',
        locationName: 'brazil2',
        totalAreaHa: 1.2921,
        statusCode: 2,
        locationError: null,
        emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.3258}',
        efCo2ByYear: '{}',
        efCh4ByYear: '{}',
        efN2oByYear: '{}',
        emissionsCo2Yearly: '{"2021":1}',
        emissionsCh4Yearly: '{"2021":2}',
        emissionsN2oYearly: '{"2021":3}',
        emissionsYearly: '{"2021":6}',
        production: 10.5,
        weightedAvgYield: 2.5,
      },
      {
        listId: 1,
        country: 'Mock Country',
        state: 'Mock State',
        subState: 'Mock SubState',
        locationName: 'arg3 landmark',
        totalAreaHa: 1.1921,
        statusCode: 2,
        locationError: null,
        emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.4258}',
        efCo2ByYear: '{}',
        efCh4ByYear: '{}',
        efN2oByYear: '{}',
        emissionsCo2Yearly: '{"2021":4}',
        emissionsCh4Yearly: '{"2021":5}',
        emissionsN2oYearly: '{"2021":6}',
        emissionsYearly: '{"2021":15}',
        production: 8.1,
        weightedAvgYield: 1.9,
      },
    ];
    const listId = 1;
    const { getConnection, queryBuilder } = buildConnectionMock(rawRows);
    clientStoreConnection.getConnection = getConnection;

    const response = await ghgService.getGHGDataPerPage(listId, {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 2,
      pageNumber: 0,
    });

    expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
      '(SELECT * FROM dbo.[mock_list_table])',
      'lt',
      'lt.location_id = ghg.location_id'
    );
    expect(queryBuilder.offset).toHaveBeenCalledWith(0);
    expect(queryBuilder.limit).toHaveBeenCalledWith(2);
    expect(response).toEqual([
      {
        listId: listId,
        listName: 'mockedListName',
        country: 'Mock Country',
        state: 'Mock State',
        subState: 'Mock SubState',
        locationName: 'brazil2',
        totalAreaHa: 1.2921,
        statusCode: 2,
        locationError: null,
        commodity: 'COCOA',
        combinedEmissionsFactor: '{"2021":0.5839,"2022":0.1825,"2023":0.3258}',
        ch4EmissionsFactor: '{}',
        co2EmissionsFactor: '{}',
        n2oEmissionsFactor: '{}',
        emissionsCo2Yearly: '{"2021":1}',
        emissionsCh4Yearly: '{"2021":2}',
        emissionsN2oYearly: '{"2021":3}',
        emissionsYearly: '{"2021":6}',
        production: 10.5,
        weightedAvgYield: 2.5,
      },
      {
        listId: 1,
        listName: 'mockedListName',
        locationName: 'arg3 landmark',
        country: 'Mock Country',
        state: 'Mock State',
        subState: 'Mock SubState',
        totalAreaHa: 1.1921,
        statusCode: 2,
        locationError: null,
        commodity: 'COCOA',
        combinedEmissionsFactor: '{"2021":0.5839,"2022":0.1825,"2023":0.4258}',
        ch4EmissionsFactor: '{}',
        co2EmissionsFactor: '{}',
        n2oEmissionsFactor: '{}',
        emissionsCo2Yearly: '{"2021":4}',
        emissionsCh4Yearly: '{"2021":5}',
        emissionsN2oYearly: '{"2021":6}',
        emissionsYearly: '{"2021":15}',
        production: 8.1,
        weightedAvgYield: 1.9,
      },
    ]);
  });
  it(`Should not find GHG data for an inexistent ID`, async () => {
    const listId = 2;
    const { getConnection } = buildConnectionMock([]);
    clientStoreConnection.getConnection = getConnection;
    const response = await ghgService.getGHGDataPerPage(listId, {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 2,
      pageNumber: 0,
    });
    expect(response).toEqual([]);
  });
  it(`Should return empty data when the list has no list_table_name`, async () => {
    const listId = 3;
    const { getConnection, queryBuilder } = buildConnectionMock([], {
      listTableName: null,
    });
    clientStoreConnection.getConnection = getConnection;
    const response = await ghgService.getGHGDataPerPage(listId, {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 2,
      pageNumber: 0,
    });
    expect(response).toEqual([]);
    expect(queryBuilder.getRawMany).not.toHaveBeenCalled();
  });
});
