import * as request from 'supertest';
import { Test } from '@nestjs/testing';

import { AfiService } from './afi.service';
import { AfiController } from './afi.controller';
import { INestApplication } from '@nestjs/common';

describe('[GET] /afi/:listId/number-of-pages', () => {
  let afiService: AfiService;
  let app: INestApplication;

  it(`when database return data`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AfiController],
      providers: [AfiService],
    }).compile();

    afiService = moduleRef.get<AfiService>(AfiService);
    moduleRef.get<AfiController>(AfiController);

    jest.spyOn(afiService, 'getNumberOfPagesAfiAnalysis').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          id: 350,
          quantity: 10,
        });
      });
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/afi/5692/number-of-pages?clientDatabase=production&rowsPerPage=5'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      clientDatabase: 'production',
      pages: 2,
      rowsPerPage: '5',
    });

    await app.close();
  });

  it(`when quantity is 0`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AfiController],
      providers: [AfiService],
    }).compile();

    afiService = moduleRef.get<AfiService>(AfiService);
    moduleRef.get<AfiController>(AfiController);

    jest.spyOn(afiService, 'getNumberOfPagesAfiAnalysis').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          id: 350,
          quantity: 0,
        });
      });
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/afi/5692/number-of-pages?clientDatabase=production&rowsPerPage=5'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      clientDatabase: 'production',
      pages: 0,
      rowsPerPage: '5',
    });

    await app.close();
  });

  it(`when dont receive query param`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AfiController],
      providers: [AfiService],
    }).compile();

    afiService = moduleRef.get<AfiService>(AfiService);
    moduleRef.get<AfiController>(AfiController);

    jest.spyOn(afiService, 'getNumberOfPagesAfiAnalysis').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          id: 350,
          quantity: 0,
        });
      });
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get('/afi/5692/number-of-pages');
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

describe('[GET] /afi/:listId/data-per-page', () => {
  let afiService: AfiService;
  let app: INestApplication;

  it(`when database return data`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AfiController],
      providers: [AfiService],
    }).compile();

    afiService = moduleRef.get<AfiService>(AfiService);
    moduleRef.get<AfiController>(AfiController);

    jest.spyOn(afiService, 'getAfiDataPerPage').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve([
          {
            listId: 5692,
            listName: 'Test WRI List',
            locationId: 5631,
            gadmId: 'BRA.1_1',
            coverageHA: 0,
            naturalForestLossHA: 0,
            totalAreaHa: 0,
            negligibleRisk: 80,
            statusCode: 200,
            locationError: null,
            locationName: 'WRI Forest Atlas',
            country: 'Brazil',
            state: 'Acre',
            subState: 'Acre',
          },
        ]);
      });
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/afi/5692/data-per-page?clientDatabase=production&rowsPerPage=5'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual([
      {
        country: 'Brazil',
        coverageHA: 0,
        gadmId: 'BRA.1_1',
        listId: 5692,
        listName: 'Test WRI List',
        locationError: null,
        locationId: 5631,
        locationName: 'WRI Forest Atlas',
        naturalForestLossHA: 0,
        negligibleRisk: 80,
        state: 'Acre',
        statusCode: 200,
        subState: 'Acre',
        totalAreaHa: 0,
      },
    ]);

    await app.close();
  });

  it(`when return is empty`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AfiController],
      providers: [AfiService],
    }).compile();

    afiService = moduleRef.get<AfiService>(AfiService);
    moduleRef.get<AfiController>(AfiController);

    jest.spyOn(afiService, 'getAfiDataPerPage').mockImplementation(() => {
      return new Promise((resolve) => resolve([]));
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/afi/5692/data-per-page?clientDatabase=production&rowsPerPage=5'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual([]);

    await app.close();
  });

  it(`when dont sent query param`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AfiController],
      providers: [AfiService],
    }).compile();

    afiService = moduleRef.get<AfiService>(AfiService);
    moduleRef.get<AfiController>(AfiController);

    jest.spyOn(afiService, 'getAfiDataPerPage').mockImplementation(() => {
      return new Promise((resolve) => resolve([]));
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get('/afi/5692/data-per-page');
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
