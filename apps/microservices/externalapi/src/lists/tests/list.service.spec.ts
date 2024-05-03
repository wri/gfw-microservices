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
import { S3Service } from '@wri-monorepos/aws';
import { NotFoundException } from '@nestjs/common';

describe('ListService', () => {
  let organizationService: OrganizationService;
  let module: TestingModule;
  let listService: ListService;
  let clientStoreConnection: ClientStoreConnection;
  let s3Service: S3Service;
  const listId = 123;
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
  const paginatedInfoListsResult = [
    {
      id: 1024,
      listName: 'Recent test a',
      listLocationsCount: null,
    },
    {
      id: 1025,
      listName: 'Recent test a2',
      listLocationsCount: null,
    },
    {
      id: 1027,
      listName: 'southest asia test',
      listLocationsCount: 1,
    },
    {
      id: 1029,
      listName: 'Recent Investments',
      listLocationsCount: 1,
    },
    {
      id: 1043,
      listName: 'testbeef',
      listLocationsCount: 1,
    },
    {
      id: 1046,
      listName: 'Recent Cocoa Generic Gust123',
      listLocationsCount: 999,
    },
    {
      id: 1050,
      listName: 'Recent Cocoa Generic gust 20230829',
      listLocationsCount: null,
    },
    {
      id: 1052,
      listName: 'Recent Cocoa Generic gust 202308290052',
      listLocationsCount: null,
    },
    {
      id: 1003,
      listName: 'Recent Cocoa Generic 2023008290059',
      listLocationsCount: null,
    },
    {
      id: 1004,
      listName: 'Recent Cocoa Generic 2023008290156',
      listLocationsCount: null,
    },
    {
      id: 1005,
      listName: 'Recent Cocoa Generic 202308290119',
      listLocationsCount: null,
    },
    {
      id: 1006,
      listName: 'Recent Cocoa Generic 202308290126',
      listLocationsCount: null,
    },
    {
      id: 1007,
      listName: 'Recent Cocoa Generic 202308290130',
      listLocationsCount: null,
    },
    {
      id: 1008,
      listName: 'Recent Cocoa Generic 202308290146',
      listLocationsCount: null,
    },
    {
      id: 1009,
      listName: 'Recent Cocoa Generic 202308290152',
      listLocationsCount: null,
    },
    {
      id: 1060,
      listName: 'Recent Cocoa Generic 202308290905',
      listLocationsCount: null,
    },
    {
      id: 1061,
      listName: 'Recent Cocoa Generic 202308290913',
      listLocationsCount: null,
    },
    {
      id: 1067,
      listName: 'Recent Cocoa Generic gust 1',
      listLocationsCount: null,
    },
    {
      id: 1068,
      listName: 'Recent Cocoa Generic 202308290943',
      listLocationsCount: null,
    },
    {
      id: 1069,
      listName: 'Recent Cocoa Generic 202308301039',
      listLocationsCount: null,
    },
    {
      id: 1071,
      listName: 'Recent Cocoa Generic 202308301048',
      listLocationsCount: null,
    },
    {
      id: 1072,
      listName: 'Recent Cocoa Generic 202309301057',
      listLocationsCount: null,
    },
    {
      id: 1074,
      listName: 'Recent Cocoa Generic 202309301215',
      listLocationsCount: null,
    },
    {
      id: 1075,
      listName: 'Recent Cocoa Generic 202309301221',
      listLocationsCount: null,
    },
    {
      id: 1076,
      listName: 'Recent Cocoa Generic 202308301749',
      listLocationsCount: null,
    },
    {
      id: 1077,
      listName: 'Recent Cocoa Generic 202308301829',
      listLocationsCount: null,
    },
    {
      id: 1078,
      listName: 'Recent Cocoa Generic 202308301857',
      listLocationsCount: null,
    },
    {
      id: 1079,
      listName: 'Recent Cocoa Generic 202308301957',
      listLocationsCount: null,
    },
    {
      id: 1080,
      listName: 'Recent Cocoa Generic 202309302052',
      listLocationsCount: null,
    },
    {
      id: 1081,
      listName: 'Recent Cocoa Generic 202308302222',
      listLocationsCount: 994,
    },
    {
      id: 1082,
      listName: 'Recent Cocoa Generic 202309302231',
      listLocationsCount: null,
    },
    {
      id: 1083,
      listName: 'Recent Cocoa Generic 202309302238',
      listLocationsCount: 998,
    },
    {
      id: 1084,
      listName: 'cocoa generic 20230923 3112',
      listLocationsCount: null,
    },
    {
      id: 1085,
      listName: 'cocoa generic 20230923 3112',
      listLocationsCount: null,
    },
    {
      id: 1086,
      listName: 'cocoa generic 20230923 3112',
      listLocationsCount: null,
    },
    {
      id: 1087,
      listName: 'cocoa generic 20230923 3112',
      listLocationsCount: null,
    },
    {
      id: 1088,
      listName: 'cocoa generic 202308302325',
      listLocationsCount: null,
    },
    {
      id: 1089,
      listName: 'cocoa generic 202308302325',
      listLocationsCount: null,
    },
    {
      id: 1090,
      listName: 'cg 302345',
      listLocationsCount: null,
    },
    {
      id: 1091,
      listName: 'cg 202349',
      listLocationsCount: null,
    },
    {
      id: 1092,
      listName: 'cg 202349',
      listLocationsCount: null,
    },
    {
      id: 1093,
      listName: 'cg 300000',
      listLocationsCount: null,
    },
    {
      id: 1094,
      listName: 'cg 300000',
      listLocationsCount: null,
    },
    {
      id: 1095,
      listName: 'cg 300000',
      listLocationsCount: null,
    },
    {
      id: 1096,
      listName: 'cg 310010',
      listLocationsCount: null,
    },
    {
      id: 1097,
      listName: 'cg 310015',
      listLocationsCount: null,
    },
    {
      id: 1098,
      listName: 'cg 310017',
      listLocationsCount: null,
    },
    {
      id: 1099,
      listName: 'Recent Cocoa Generic 311216',
      listLocationsCount: 999,
    },
    {
      id: 1600,
      listName: 'cg 311223 llp',
      listLocationsCount: null,
    },
    {
      id: 1605,
      listName: 'cg 311423',
      listLocationsCount: null,
    },
  ];
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
        S3Service,
      ],
    }).compile();
  });

  beforeEach(async () => {
    organizationService = module.get<OrganizationService>(OrganizationService);
    listService = module.get<ListService>(ListService);
    clientStoreConnection = module.get<ClientStoreConnection>(ClientStoreConnection);
    s3Service = module.get<S3Service>(S3Service);
  });

  it('Should get List', async () => {
    const organizationId = 1;

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
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
    const repositoryResult = expectedResult;
    repositoryResult['errorFileStoragePath'] =
      's3://bucketname/enviroment/status/erro_name.file_extension';

    const expectedResultWithErroPath = {
      ...repositoryResult,
      errorFileStoragePath: 's3://bucketname/enviroment/status/erro_name.file_extension',
    };
    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
      subscriptionStatusId: 1,
    });
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOneBy: () => ({ ...repositoryResult }),
      }),
    });
    s3Service.getFileSignedUrlDynamicEnvironment = jest
      .fn()
      .mockResolvedValue(expectedResult.errorFileStoragePath);
    const result = await listService.getList({ organizationId, listId, analysisId: 'FCD' });

    const resultWithDatesTransformed = {};
    for (const prop in result) {
      const value = result[prop];
      resultWithDatesTransformed[prop] =
        value instanceof Date ? value.toLocaleDateString('en-US') : value;
    }

    expect(resultWithDatesTransformed).toEqual(expectedResultWithErroPath);
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
      renewalTime: new Date(),
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
  it('Should get info from list', async () => {
    const organizationId = 1;
    const listInformationExpected = {
      listId: expectedResult.id,
      listName: expectedResult.listName,
      locationCount: expectedResult.listLocationsCount,
    };
    organizationService.findOrganizationById = jest.fn().mockResolvedValue(listInformationExpected);
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: () => ({ ...expectedResult }),
      }),
    });

    const result = await listService.getListInfo(organizationId, listId);

    const resultWithDatesTransformed = {};
    for (const prop in result) {
      const value = result[prop];
      resultWithDatesTransformed[prop] =
        value instanceof Date ? value.toLocaleDateString('en-US') : value;
    }

    expect(resultWithDatesTransformed).toEqual(listInformationExpected);
  });
  it('Should not find info list', async () => {
    const organizationId = 1;
    const listInformationExpected = {
      listId: expectedResult.id,
      listName: expectedResult.listName,
      locationCount: expectedResult.listLocationsCount,
    };
    organizationService.findOrganizationById = jest.fn().mockResolvedValue(listInformationExpected);
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: () => null,
      }),
    });

    await expect(listService.getListInfo(organizationId, listId)).rejects.toThrowError(
      NotFoundException
    );
  });
  it('It should return paginated info lists with default pageSize and pageNum', async () => {
    const organizationId = 1;
    const listInformationExpected = {
      listId: expectedResult.id,
      listName: expectedResult.listName,
      locationCount: expectedResult.listLocationsCount,
    };
    const expectedPaginatedInfoLists = [
      {
        listId: 1024,
        listName: 'Recent test a',
        locationCount: null,
      },
      {
        listId: 1025,
        listName: 'Recent test a2',
        locationCount: null,
      },
      {
        listId: 1027,
        listName: 'southest asia test',
        locationCount: 1,
      },
      {
        listId: 1029,
        listName: 'Recent Investments',
        locationCount: 1,
      },
      {
        listId: 1043,
        listName: 'testbeef',
        locationCount: 1,
      },
      {
        listId: 1046,
        listName: 'Recent Cocoa Generic Gust123',
        locationCount: 999,
      },
      {
        listId: 1050,
        listName: 'Recent Cocoa Generic gust 20230829',
        locationCount: null,
      },
      {
        listId: 1052,
        listName: 'Recent Cocoa Generic gust 202308290052',
        locationCount: null,
      },
      {
        listId: 1003,
        listName: 'Recent Cocoa Generic 2023008290059',
        locationCount: null,
      },
      {
        listId: 1004,
        listName: 'Recent Cocoa Generic 2023008290156',
        locationCount: null,
      },
    ];
    organizationService.findOrganizationById = jest.fn().mockResolvedValue(listInformationExpected);
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findAndCount: jest.fn().mockResolvedValue([paginatedInfoListsResult.slice(0, 10), 10]),
      }),
    });
    const paginatedInfoLists = await listService.getPaginatedListInfo(0, 0, organizationId);
    expect(paginatedInfoLists).toEqual(expectedPaginatedInfoLists);
  });
  it('It should return an error when trying to set the out-of-range value for pageSize or pageNum', async () => {
    const organizationId = 1;
    const listInformationExpected = {
      listId: expectedResult.id,
      listName: expectedResult.listName,
      locationCount: expectedResult.listLocationsCount,
    };

    organizationService.findOrganizationById = jest.fn().mockResolvedValue(listInformationExpected);
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findAndCount: jest.fn().mockResolvedValue([[], 0]),
      }),
    });
    await expect(listService.getPaginatedListInfo(30, 50, organizationId)).rejects.toThrowError(
      NotFoundException
    );
  });
  it('It should return a specific paginated info list when define pageSize and pageNum', async () => {
    const organizationId = 1;
    const listInformationExpected = {
      listId: expectedResult.id,
      listName: expectedResult.listName,
      locationCount: expectedResult.listLocationsCount,
    };
    const expectedPaginatedInfoLists = [
      {
        listId: 1027,
        listName: 'southest asia test',
        locationCount: 1,
      },
      {
        listId: 1029,
        listName: 'Recent Investments',
        locationCount: 1,
      },
    ];
    organizationService.findOrganizationById = jest.fn().mockResolvedValue(listInformationExpected);
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findAndCount: jest.fn().mockResolvedValue([paginatedInfoListsResult.slice(2, 4), 2]),
      }),
    });
    const paginatedInfoLists = await listService.getPaginatedListInfo(2, 2, organizationId);
    expect(paginatedInfoLists).toEqual(expectedPaginatedInfoLists);
  });
});
