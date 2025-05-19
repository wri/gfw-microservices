import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisController } from '../list-analysis.controller';
import { ListAnalysisService } from '../list-analysis.service';
import { createRequest } from 'node-mocks-http'; // Import the necessary library
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../api-keys/organization.entity';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { BadRequestException, INestApplication } from '@nestjs/common';
import { ListService } from '../../lists/lists.service';
import { ExternalAPIKey, SqlModule, UserRoutes } from '@wri-monorepos/sql';

describe('ListAnalysisController', () => {
  let controller: ListAnalysisController;
  let app: INestApplication;

  const expectedResult = {
    listId: 123,
    status: 'Completed',
    errorsDetails: [],
    resultUrl: 'https://example.com/results',
    creationDate: new Date('2023-09-28'),
    expirationDate: new Date('2023-09-28'),
  };

  const mockLocationsWithErrors = [
    {
      locationName: 'Location 1',
      errorDetails: 'Error 1',
    },
    {
      locationName: 'Location 2',
      errorDetails: 'Error 2',
    },
  ];

  const expectedResultWithErroPath = {
    listId: 123,
    status: 'Completed',
    errorsDetails: ['s3://gfwpro-geotrellis-pre-data/example.com/errors'],
    resultUrl: 'https://example.com/results',
    creationDate: new Date('2023-09-28'),
    expirationDate: new Date('2023-09-28'),
  };
  const expectedListResult = {
    listId: 123,
    status: 'Completed',
    errorsDetails: [],
    resultUrl: 'https://example.com/results',
    creationDate: new Date('2023-09-28'),
    expirationDate: new Date('2023-09-28'),
  };
  const mockResponseDeleteList = 'User email@email has deleted list listName';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [Organization, UserRoutes, ExternalAPIKey],
        }),
        TypeOrmModule.forFeature([Organization, ExternalAPIKey, UserRoutes], 'default'),
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      controllers: [ListAnalysisController],
      providers: [
        SqlModule,
        {
          provide: ListAnalysisService,
          useValue: {
            getAnalysisStatus: jest.fn(() => expectedResult),
            getAnalysisStatusWithErrorFileStoragePath: jest.fn(() => expectedResultWithErroPath),
            deleteList: jest.fn(() => mockResponseDeleteList),
            getLocationsErrors: jest.fn().mockResolvedValue(mockLocationsWithErrors),
          },
        },
        {
          provide: ListService,
          useValue: {
            getList: jest.fn(() => expectedListResult),
          },
        },
      ],
    }).compile();

    controller = module.get<ListAnalysisController>(ListAnalysisController);

    app = module.createNestApplication();
    await app.init();
  });

  it('should return analysis status', async () => {
    const listId = 123;
    const analysisId = 'FCD';

    // Mock the request object with the 'x-api-key' header
    const requestMock = createRequest({
      method: 'GET',
      url: `/api/v1/list/${listId}/analysis/FCD/status`,
      headers: {
        'x-api-key': 'your-api-key',
      },
      user: {
        organizationId: 1,
      },
    });
    controller.getAnalysisStatus = jest.fn().mockResolvedValue({
      ...expectedResult,
    });

    const result = await controller.getAnalysisStatus(listId, analysisId, requestMock);
    expect(result).toMatchObject(expectedResult);
  });
  it('should return a successful response containing errorFileStoragePath', async () => {
    const listId = 123;
    const analysisId = 'FCD';

    // Mock the request object with the 'x-api-key' header
    const requestMock = createRequest({
      method: 'GET',
      url: `/api/v1/list/${listId}/analysis/FCD/status`,
      headers: {
        'x-api-key': 'your-api-key',
      },
      user: {
        organizationId: 1,
      },
    });

    const result = await controller.getAnalysisStatus(listId, analysisId, requestMock);
    expect(result).toMatchObject({});
  });

  it.each(['AFI', 'RandomWrongType'])(
    'should return 400 if analysisIDs is not valid',
    async (analysisIds) => {
      const { statusCode } = await request(app.getHttpServer()).get(
        `/v1/list/123/analysis/${analysisIds}/status`
      );

      expect(statusCode).toBe(400);
    }
  );
  it('should delete list', async () => {
    const listId = 123;

    // Mock the request object with the 'x-api-key' header
    const requestMock = createRequest({
      method: 'GET',
      url: `/api/v1/list/${listId}/delete/list`,
      headers: {
        'x-api-key': 'your-api-key',
      },
      user: {
        organizationId: 1,
        userEmail: 'email@email.com',
      },
    });
    const mockObjectDeleteListResponse = { message: mockResponseDeleteList };
    const deleteBodyList = { userEmail: 'email@email.com' };
    const result = await controller.deleteList(listId, deleteBodyList, requestMock);
    expect(result).toEqual(mockObjectDeleteListResponse);
  });
  it('should return unauthorized exception when userEmail is not valid', async () => {
    const listId = 123;

    // Mock the request object with the 'x-api-key' header
    const requestMock = createRequest({
      method: 'GET',
      url: `/api/v1/list/${listId}/delete/list`,
      headers: {
        'x-api-key': 'your-api-key',
      },
      user: {
        organizationId: 1,
        userEmail: 'wrongEmail',
      },
    });
    const deleteBodyList = { userEmail: 'email@email.com' };
    await expect(controller.deleteList(listId, deleteBodyList, requestMock)).rejects.toThrowError(
      BadRequestException
    );
  });
  it('should failed zod validations when receiving an unknown alerts type', async () => {
    const listId = 5828;
    const analysisId = 'unknown_type';
    const alertsGenerate = { userEmail: 'email@email.com' };
    const expectedResult = [
      {
        code: 'invalid_enum_value',
        message: `Invalid enum value. Expected 'Alerts' | 'FCD' | 'DefReport' | 'GHG', received '${analysisId}'`,
        options: ['Alerts', 'FCD', 'DefReport', 'GHG'],
        path: [],
        received: 'unknown_type',
      },
    ];
    const {
      body: { details: response },
    } = await request(app.getHttpServer())
      .post(`/v1/list/${listId}/analysis/${analysisId}/generate`)
      .send(alertsGenerate);
    expect(response).toEqual(expectedResult);
  });
});
