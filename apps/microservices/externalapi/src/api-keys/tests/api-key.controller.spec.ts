import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import * as request from 'supertest';
import * as sinon from 'sinon';
import * as AWS from 'aws-sdk';

import { APIKeyController } from '../api-key.controller';
import { TokenService } from '../token.service';
import { UserRoutes } from '../user-route.entity';
import { TokenMockRepository, UserMockRepository } from './token.mock.service';
import { Organization } from '../organization.entity';
import { ExternalAPIKey } from '../external-api-key.entity';
import { ConfigModule } from '@nestjs/config';

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
          entities: [Organization, ExternalAPIKey, UserRoutes],
        }),
        TypeOrmModule.forFeature([Organization, ExternalAPIKey, UserRoutes], 'default'),
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

    const awsConfig = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    };

    AWS.config.update(awsConfig);

    const apiGatewayInstance = {
      createApiKey: sandbox.stub().returns({
        promise: sandbox.stub().resolves({
          /* Mock response for createApiKey */
        }),
      }),
      createUsagePlanKey: sandbox.stub().returns({
        promise: sandbox.stub().resolves({
          /* Mock response for createUsagePlanKey */
        }),
      }),
      // You can add other methods and their responses as needed
    };

    // Redefine AWS.APIGateway.prototype to return the instance with the stubbed methods
    Object.defineProperty(AWS.APIGateway.prototype, 'createApiKey', {
      value: apiGatewayInstance.createApiKey,
    });

    Object.defineProperty(AWS.APIGateway.prototype, 'createUsagePlanKey', {
      value: apiGatewayInstance.createUsagePlanKey,
    });

    const dummyGateway = new AWS.APIGateway();
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

    sandbox.stub(dummyGateway.constructor.prototype, 'createUsagePlanKey').returns({
      promise: () => {
        return {
          /**
           * The Id of a usage plan key.
           */
          id: 'string',
          /**
           * The type of a usage plan key. Currently, the valid key type is API_KEY.
           */
          type: 'API_KEY',
          /**
           * The value of a usage plan key.
           */
          value: 'string',
          /**
           * The name of a usage plan key.
           */
          name: 'string',
        };
      },
    });

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

    test('should return 404 when orgId is not found', async () => {
      const { statusCode } = await request(app.getHttpServer()).get('/api-keys/50');

      expect(statusCode).toBe(404);
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
