import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import * as request from 'supertest';
import * as sinon from 'sinon';
import { APIGateway } from '@aws-sdk/client-api-gateway';

import { APIKeyController } from '../api-key.controller';
import { TokenService } from '../token.service';
import { TokenMockRepository, UserMockRepository } from './token.mock.service';
import { ConfigModule } from '@nestjs/config';
import { ExternalAPIKey, FeatureFlag, Organization, UserRoutes } from '@wri-monorepos/sql';

describe('api-key', () => {
  let app: INestApplication;
  const sandbox = sinon.createSandbox();

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [Organization, ExternalAPIKey, UserRoutes, FeatureFlag],
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
      controllers: [APIKeyController],
      providers: [
        {
          provide: getRepositoryToken(ExternalAPIKey, 'default'),
          useClass: TokenMockRepository,
        },
        {
          provide: getRepositoryToken(UserRoutes, 'default'),
          useClass: UserMockRepository,
        },
        TokenService,
      ],
    }).compile();

    const dummyGateway = new APIGateway();
    sandbox.stub(dummyGateway.constructor.prototype, 'createApiKey').returns({
      promise: () => {
        return {
          id: 'd3grev7wa4',
          value: 'HkIXacIxu73fo9T3EfRaP9OnUryUCLOV8WO87oIL',
          name: 'externalapi',
          enabled: true,
          createdDate: new Date(),
          lastUpdatedDate: new Date(),
          stageKeys: [],
        };
      },
    });

    // Note: createUsagePlanKey stub removed - not supported in API Gateway V2

    const stub = sandbox.stub(dummyGateway.constructor.prototype, 'deleteApiKey');

    stub.withArgs({ apiKey: '789' }).returns({
      promise: () => {
        return {};
      },
    });

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('On GET request to /api-keys', () => {
    test('should return 200 when orgId is found', async () => {
      const { statusCode } = await request(app.getHttpServer()).get('/api-keys/9');

      expect(statusCode).toBe(200);
    });

    test('should return 200 with empty array when orgId has no tokens', async () => {
      const { statusCode, body } = await request(app.getHttpServer()).get('/api-keys/50');

      expect(statusCode).toBe(200);
      expect(body).toEqual([]);
    });
  });

  test('On POST request to /api-keys should return 201', async () => {
    const { statusCode } = await request(app.getHttpServer())
      .post('/api-keys')
      .send({ userId: 23, organizationId: 10 });

    expect(statusCode).toBe(201);
  });

  test('On DELETE request to /api-keys should return 200', async () => {
    const { statusCode } = await request(app.getHttpServer()).delete('/api-keys/9/789');

    expect(statusCode).toBe(200);
  });
});
