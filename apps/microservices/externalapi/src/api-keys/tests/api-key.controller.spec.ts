import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import * as request from 'supertest';
import { Organization } from '../organization.entity';
import { ExternalAPIKey } from '../external-api-key.entity';
import { UserRoutes } from '../user-route.entity';
import { TokenMockRepository, UserMockRepository } from './token.mock.service';
import { TokenService } from '../token.service';

// import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';

// import { TokenSeederService } from './util/token-seeder';
// import { TypeOrmSQLITETestingModule } from './util/type-orm-sqlite-testing-module';
// import {AppModule} from '../../app/app.module'
// import { AppController } from '../../app/app.controller';
// import { AppService } from '../../app/app.service';

describe('api-key', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // const moduleFixture = await Test.createTestingModule({
    //   imports: []
    // }).compile();

    const moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [Organization, ExternalAPIKey, UserRoutes],
        }),
        TypeOrmModule.forFeature([Organization, ExternalAPIKey, UserRoutes], 'default'),
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
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

    // const seederService = moduleFixture.get<TokenSeederService>(TokenSeederService);
    // await seederService.seed();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] healthCheck', async () => {
    const httpServer = app.getHttpServer();
    const httpRequest = request(httpServer);
    const response = await httpRequest.get('/api/HealthCheck');

    console.log({response});

    expect(response.statusCode).toBe(404);
  });
});
