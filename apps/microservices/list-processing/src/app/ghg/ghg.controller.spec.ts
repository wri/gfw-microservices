import request from 'supertest';
import { Test } from '@nestjs/testing';

import { GHGService } from './ghg.service';
import { GHGController } from './ghg.controller';
import { INestApplication } from '@nestjs/common';
import { ClientStoreConnection } from '@wri-monorepos/sql';

describe('[GET] /ghg/:listId/number-of-pages', () => {
  let ghgService: GHGService;
  let app: INestApplication;
  let clientStoreConnection: ClientStoreConnection;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GHGController],
      providers: [GHGService, ClientStoreConnection],
    }).compile();

    ghgService = moduleRef.get<GHGService>(GHGService);
    clientStoreConnection = moduleRef.get<ClientStoreConnection>(ClientStoreConnection);
    moduleRef.get<GHGController>(GHGController);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`when database return data`, async () => {
    jest.spyOn(clientStoreConnection, 'getConnection').mockImplementation();
    jest.spyOn(ghgService, 'getNumberOfPagesGHGAnalysis').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          id: 350,
          quantity: 10,
        });
      });
    });

    const response = await request(app.getHttpServer()).get(
      '/ghg/5692/number-of-pages?clientDatabase=production&rowsPerPage=5'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      clientDatabase: 'production',
      pages: 2,
      rowsPerPage: 5,
    });

    await app.close();
  });

  it(`when quantity is 0`, async () => {
    jest.spyOn(ghgService, 'getNumberOfPagesGHGAnalysis').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          id: 350,
          quantity: 0,
        });
      });
    });

    const response = await request(app.getHttpServer()).get(
      '/ghg/5692/number-of-pages?clientDatabase=production&rowsPerPage=5'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      clientDatabase: 'production',
      pages: 0,
      rowsPerPage: 5,
    });

    await app.close();
  });

  it(`when dont receive query param`, async () => {
    jest.spyOn(ghgService, 'getNumberOfPagesGHGAnalysis').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          id: 350,
          quantity: 0,
        });
      });
    });

    const response = await request(app.getHttpServer()).get('/ghg/5692/number-of-pages');
    expect(response.status).toEqual(400);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      details: [
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Required',
          path: ['clientDatabase'],
          received: 'undefined',
        },
        {
          code: 'invalid_type',
          expected: 'number',
          message: 'Expected number, received nan',
          path: ['rowsPerPage'],
          received: 'nan',
        },
      ],
      name: 'ZodValidationError',
    });

    await app.close();
  });
});

describe('[GET] /ghg/:listId/data-per-page', () => {
  let ghgService: GHGService;
  let app: INestApplication;
  let clientStoreConnection: ClientStoreConnection;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GHGController],
      providers: [GHGService, ClientStoreConnection],
    }).compile();

    ghgService = moduleRef.get<GHGService>(GHGService);
    clientStoreConnection = moduleRef.get<ClientStoreConnection>(ClientStoreConnection);
    moduleRef.get<GHGController>(GHGController);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`when database return data`, async () => {
    jest.spyOn(clientStoreConnection, 'getConnection').mockImplementation();
    jest.spyOn(ghgService, 'getGHGDataPerPage').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve([
          {
            listId: 5692,
            listName: 'Test WRI List',
            locationId: 5631,
            totalAreaHA: 0,
            statusCode: 200,
            locationError: null,
            commodity: 'SOYB',
            emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.3258}',
          },
        ]);
      });
    });

    const response = await request(app.getHttpServer()).get(
      '/ghg/5692/data-per-page?clientDatabase=production&rowsPerPage=5'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual([
      {
        listId: 5692,
        listName: 'Test WRI List',
        locationId: 5631,
        totalAreaHA: 0,
        statusCode: 200,
        locationError: null,
        commodity: 'SOYB',
        emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.3258}',
      },
    ]);

    await app.close();
  });

  it(`when return is empty`, async () => {
    jest.spyOn(ghgService, 'getGHGDataPerPage').mockImplementation(() => {
      return new Promise((resolve) => resolve([]));
    });

    const response = await request(app.getHttpServer()).get(
      '/ghg/5692/data-per-page?clientDatabase=production&rowsPerPage=5'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual([]);

    await app.close();
  });

  it(`when dont sent query param`, async () => {
    jest.spyOn(ghgService, 'getGHGDataPerPage').mockImplementation(() => {
      return new Promise((resolve) => resolve([]));
    });

    const response = await request(app.getHttpServer()).get('/ghg/5692/data-per-page');
    expect(response.status).toEqual(400);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      details: [
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Required',
          path: ['clientDatabase'],
          received: 'undefined',
        },
        {
          code: 'invalid_type',
          expected: 'number',
          message: 'Expected number, received nan',
          path: ['rowsPerPage'],
          received: 'nan',
        },
      ],
      name: 'ZodValidationError',
    });

    await app.close();
  });
});
