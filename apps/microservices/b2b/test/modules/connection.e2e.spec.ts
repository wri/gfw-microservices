import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmSQLITETestingModule } from '../utils/create-typeorm-test-module';
import { ConnectionModule } from '../../src/Connection/connection.module';
import { ConnectionRequest } from '../../src/Connection/domain/connection.entity';

describe('Connections (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ...TypeOrmSQLITETestingModule([ConnectionRequest]),
        ConnectionModule,
      ],
      providers: [ConnectionModule],
    }).compile();


    app = module.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/organization/:orgId')
      .expect(200)
  });
});
