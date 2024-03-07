import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { FCDService } from './fcd.service';
import { FCDController } from './fcd.controller';
import { INestApplication } from '@nestjs/common';

describe('[GET] /:listId/wdpa_overlap_country/:country', () => {
  let fcdService: FCDService;
  let app: INestApplication;

  it(`when database return data`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FCDController],
      providers: [FCDService],
    }).compile();

    fcdService = moduleRef.get<FCDService>(FCDService);
    moduleRef.get<FCDController>(FCDController);

    jest.spyOn(fcdService, 'getProtectedAreasByCategoryAreaData').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve([
          {
            listId: 5692,
            locationId: 2,
            protectedAreasByCategoryArea: '{}',
          },
          {
            listId: 5692,
            locationId: 3,
            protectedAreasByCategoryArea: '{}',
          },
          {
            listId: 5692,
            locationId: 4,
            protectedAreasByCategoryArea: '{}',
          },
          {
            listId: 5692,
            locationId: 6,
            protectedAreasByCategoryArea:
              '{"Category Ia":1620.7222,"Category II":156.9743,"Category VI":0.2748}',
          },
        ]);
      });
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/fcd/5692/wdpa_overlap_country/Argentina?clientDatabase=production'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      overlap: {
        fullyRestrictive: 1777.6965,
        lessRestricted: 0.2748,
      },
    });

    await app.close();
  });

  it(`when return empty database`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FCDController],
      providers: [FCDService],
    }).compile();

    fcdService = moduleRef.get<FCDService>(FCDService);
    moduleRef.get<FCDController>(FCDController);

    jest.spyOn(fcdService, 'getProtectedAreasByCategoryAreaData').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve([]);
      });
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/fcd/5692/wdpa_overlap_country/Argentina?clientDatabase=production'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      overlap: {
        fullyRestrictive: 0,
        lessRestricted: 0,
      },
    });

    await app.close();
  });

  it(`realize request without database param`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FCDController],
      providers: [FCDService],
    }).compile();

    fcdService = moduleRef.get<FCDService>(FCDService);
    moduleRef.get<FCDController>(FCDController);

    jest.spyOn(fcdService, 'getProtectedAreasByCategoryAreaData').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve([]);
      });
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/fcd/5692/wdpa_overlap_country/Argentina'
    );
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
      ],
      name: 'ZodValidationError',
    });

    await app.close();
  });
});
describe('[GET] /:listId/landmark_overlap_country/:country', () => {
  let fcdService: FCDService;
  let app: INestApplication;

  it(`when database return data`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FCDController],
      providers: [FCDService],
    }).compile();

    fcdService = moduleRef.get<FCDService>(FCDService);
    moduleRef.get<FCDController>(FCDController);

    jest.spyOn(fcdService, 'getLandmarkOverlapCountryData').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve([
          {
            listId: 5692,
            locationId: 2,
            totalArea: 314.2081,
            landmarkByCategoryArea: '{}',
          },
          {
            listId: 5692,
            locationId: 3,
            totalArea: 45.6463,
            landmarkByCategoryArea: '{"Not Reported":45.6463}',
          },
          {
            listId: 5692,
            locationId: 4,
            totalArea: 5024.1901,
            landmarkByCategoryArea: '{}',
          },
          {
            listId: 5692,
            locationId: 6,
            totalArea: 299.3889,
            landmarkByCategoryArea: '{"Not Reported":299.3889}',
          },
          {
            listId: 5692,
            locationId: 6,
            totalArea: 20001.9047,
            landmarkByCategoryArea: '{"Not Reported":10398.914}',
          },
        ]);
      });
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/fcd/5692/landmark_overlap_country/Argentina?clientDatabase=production'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      overlap: {
        indigenous: 10743.949200000001,
        nonIndigenous: 14941.3889,
      },
    });

    await app.close();
  });

  it(`when empty database`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FCDController],
      providers: [FCDService],
    }).compile();

    fcdService = moduleRef.get<FCDService>(FCDService);
    moduleRef.get<FCDController>(FCDController);

    jest.spyOn(fcdService, 'getLandmarkOverlapCountryData').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve([]);
      });
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/fcd/5692/landmark_overlap_country/Argentina?clientDatabase=production'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      overlap: {
        indigenous: 0,
        nonIndigenous: 0,
      },
    });

    await app.close();
  });

  it(`realize request without database param`, async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FCDController],
      providers: [FCDService],
    }).compile();

    fcdService = moduleRef.get<FCDService>(FCDService);
    moduleRef.get<FCDController>(FCDController);

    jest.spyOn(fcdService, 'getLandmarkOverlapCountryData').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve([]);
      });
    });

    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/fcd/5692/landmark_overlap_country/Argentina'
    );
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
      ],
      name: 'ZodValidationError',
    });

    await app.close();
  });
});
