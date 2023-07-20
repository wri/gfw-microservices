import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConnectionModule } from '../../src/Connection/connection.module';
import { ConnectionRequest } from '../../src/Connection/domain/connection.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createMockModule } from '@wri-monorepos/shared';
import { getConnection } from 'typeorm';

describe('Connections (e2e)', () => {
  let app;

  beforeEach(async () => {
    const module = await createMockModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          entities: [ConnectionRequest],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([ConnectionRequest]),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/ (GET)', async () => {
    return request(app.getHttpServer()).post('/api/connections').expect(200);
  });
});
