import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ConnectionRequest } from '../../src/Connection/domain/connection.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createMockModule } from '@wri-monorepos/shared';
import { INestApplication } from '@nestjs/common';
import { ConnectionModule } from '../../src/Connection/connection.module';
import { ConnectionController } from '../../src/Connection/infraestructure/connection.controller';

describe('Connections (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    /*
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
        ConnectionModule,
      ],
      controllers: [ConnectionController],
    }).compile();
    */
    const module = await createMockModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          entities: [ConnectionRequest],
          synchronize: true,
        }),
        ConnectionModule,
      ],
      controllers: [ConnectionController],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/ (GET)', async () => {
    return request(app.getHttpServer())
      .get('/connections/organization/1')
      .expect(200);
  });
});
