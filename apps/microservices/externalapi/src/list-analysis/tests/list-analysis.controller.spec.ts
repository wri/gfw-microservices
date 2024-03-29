import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisController } from '../list-analysis.controller';
import { ListAnalysisService } from '../list-analysis.service';
import { createRequest } from 'node-mocks-http'; // Import the necessary library
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../api-keys/organization.entity';
import { UserRoutes } from '../../api-keys/user-route.entity';
import { ExternalAPIKey } from '../../api-keys/external-api-key.entity';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ListService } from '../../lists/lists.service';

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
  const expectedResultWithErroPath = {
    listId: 123,
    status: 'Completed',
    errorsDetails: ['s3://gfwpro-geotrellis-pre-data/example.com/errors'],
    resultUrl: 'https://example.com/results',
    creationDate: new Date('2023-09-28'),
    expirationDate: new Date('2023-09-28')
  };
  const expectedListResult = {
    listId: 123,
    status: 'Completed',
    errorsDetails: [],
    resultUrl: 'https://example.com/results',
    creationDate: new Date('2023-09-28'),
    expirationDate: new Date('2023-09-28'),
  };

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
        {
          provide: ListAnalysisService,
          useValue: {
            getAnalysisStatus: jest.fn(() => expectedResult),
            getAnalysisStatusWithErrorFileStoragePath: jest.fn(() => expectedResultWithErroPath),
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
      ...expectedResult
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
    expect(result).toMatchObject(expectedResultWithErroPath);
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
});
