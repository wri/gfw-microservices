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

  describe('GET /api-keys', () => {
    test('token found', async () => {
      const { statusCode } = await request(app.getHttpServer()).get('/api-keys/9');

      expect(statusCode).toBe(200);
    });

    test('token not found', async () => {
      const { statusCode } = await request(app.getHttpServer()).get('/api-keys/50');

      expect(statusCode).toBe(404);
    });
  });

  test('POST /api-keys', async () => {
    const { statusCode } = await request(app.getHttpServer())
      .post('/api-keys')
      .send({ userId: 23, organizationId: 10 });

    expect(statusCode).toBe(201);
  });

  test('DELETE /api-keys', async () => {
    const { statusCode } = await request(app.getHttpServer()).delete('/api-keys/9/789');

    expect(statusCode).toBe(200);
  });
});
