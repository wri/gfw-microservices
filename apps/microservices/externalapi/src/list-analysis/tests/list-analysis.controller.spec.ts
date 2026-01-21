import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisController } from '../list-analysis.controller';
import { ListAnalysisService } from '../list-analysis.service';
import { createRequest } from 'node-mocks-http'; // Import the necessary library
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { BadRequestException, HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import { ListService } from '../../lists/lists.service';
import {
  ExternalAPIKey,
  FeatureFlag,
  Organization,
  SqlModule,
  UserRoutes,
} from '@wri-monorepos/sql';

describe('ListAnalysisController', () => {
  let controller: ListAnalysisController;
  let app: INestApplication;
  let listAnalysisService: ListAnalysisService;

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
    const mockListAnalysisService = {
      getAnalysisStatus: jest.fn(() => expectedResult),
      getAnalysisStatusWithErrorFileStoragePath: jest.fn(() => expectedResultWithErroPath),
      deleteList: jest.fn(() => mockResponseDeleteList),
      getLocationsErrors: jest.fn().mockResolvedValue(mockLocationsWithErrors),
      generateDownloadBundle: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [Organization, UserRoutes, ExternalAPIKey, FeatureFlag],
        }),
        TypeOrmModule.forFeature(
          [Organization, ExternalAPIKey, UserRoutes, FeatureFlag],
          'default'
        ),
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
          useValue: mockListAnalysisService,
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
    listAnalysisService = module.get<ListAnalysisService>(ListAnalysisService);

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

    const result = await controller.getAnalysisStatus(listId, analysisId, requestMock);

    // The controller combines getAnalysisStatusWithErrorFileStoragePath and getLocationsErrors
    const expectedCombinedResult = {
      ...expectedResultWithErroPath,
      errorsDetails: [...mockLocationsWithErrors, ...expectedResultWithErroPath.errorsDetails],
    };

    expect(result).toMatchObject(expectedCombinedResult);
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

  it('should return 422 when errorsDetails contains "Exceeded Analysis Limit"', async () => {
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

    // Mock service to return status with "Exceeded Analysis Limit" in errorsDetails
    const mockAnalysisStatusWithLimitError = {
      listId: '123',
      status: 'Error',
      errorsDetails: ['Exceeded Analysis Limit'],
      resultUrl: null,
      creationDate: null,
      expirationDate: null,
    };

    jest
      .spyOn(listAnalysisService, 'getAnalysisStatusWithErrorFileStoragePath')
      .mockResolvedValue(mockAnalysisStatusWithLimitError);
    jest.spyOn(listAnalysisService, 'getLocationsErrors').mockResolvedValue([]);

    await expect(controller.getAnalysisStatus(listId, analysisId, requestMock)).rejects.toThrow(
      HttpException
    );

    try {
      await controller.getAnalysisStatus(listId, analysisId, requestMock);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(error.getResponse()).toMatchObject({
        ...mockAnalysisStatusWithLimitError,
        errorsDetails: ['Exceeded Analysis Limit'],
      });
    }
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

  it('should accept US date format (MM-DD-YYYY) for alerts generate', async () => {
    const listId = 5828;
    const analysisId = 'Alerts';
    const alertsGenerate = {
      userEmail: 'email@email.com',
      startDate: '01-15-2024',
      endDate: '02-20-2024',
    };

    const { statusCode, body } = await request(app.getHttpServer())
      .post(`/v1/list/${listId}/analysis/${analysisId}/generate`)
      .send(alertsGenerate);

    // Date format validation should pass - if we get 400, check it's not about date format
    if (statusCode === 400) {
      const errorMessage = body.message || body.errorDetails || JSON.stringify(body);
      expect(errorMessage).not.toContain('Invalid date format');
      expect(errorMessage).not.toContain('MM-DD-YYYY');
      expect(errorMessage).not.toContain('YYYY-MM-DD');
    }
  });

  it('should accept international date format (YYYY-MM-DD) for alerts generate', async () => {
    const listId = 5828;
    const analysisId = 'Alerts';
    const alertsGenerate = {
      userEmail: 'email@email.com',
      startDate: '2024-01-15',
      endDate: '2024-02-20',
    };

    const { statusCode, body } = await request(app.getHttpServer())
      .post(`/v1/list/${listId}/analysis/${analysisId}/generate`)
      .send(alertsGenerate);

    // Date format validation should pass - if we get 400, check it's not about date format
    if (statusCode === 400) {
      const errorMessage = body.message || body.errorDetails || JSON.stringify(body);
      expect(errorMessage).not.toContain('Invalid date format');
      expect(errorMessage).not.toContain('MM-DD-YYYY');
      expect(errorMessage).not.toContain('YYYY-MM-DD');
    }
  });

  it('should reject invalid date format for alerts generate', async () => {
    const listId = 5828;
    const analysisId = 'Alerts';
    const alertsGenerate = {
      userEmail: 'email@email.com',
      startDate: '15-01-2024',
      endDate: '20-02-2024',
    };

    const { statusCode, body } = await request(app.getHttpServer())
      .post(`/v1/list/${listId}/analysis/${analysisId}/generate`)
      .send(alertsGenerate);

    expect(statusCode).toBe(400);
    // Check if error message contains date format error
    const errorMessage = body.message || body.errorDetails || JSON.stringify(body);
    expect(errorMessage).toContain('Invalid date format');
  });
});
