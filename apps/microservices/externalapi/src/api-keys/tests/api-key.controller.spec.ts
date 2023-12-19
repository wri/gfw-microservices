import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import * as request from 'supertest';

describe('api-key', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });
  test('[GET] /:organizationId - invalid org', async () => {
    const INVALID_ORG_ID = 20;
    const response = await request(app.getHttpServer()).get(`/api/api-keys/${INVALID_ORG_ID}`);

    expect(response.statusCode).toBe(404);
  });
});
