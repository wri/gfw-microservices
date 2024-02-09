import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertsRepository } from './alerts.repository';
import { ConfigModule } from '@nestjs/config';
import { GFWList, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Alerts Controller', () => {
  let alertsService: AlertsService;
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule,
        SqlModule,
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [GFWList],
        }),
        TypeOrmModule.forFeature([GFWList], 'default'),
      ],
      controllers: [AlertsController],
      providers: [AlertsService, AlertsRepository],
    }).compile();

    alertsService = moduleRef.get<AlertsService>(AlertsService);
    moduleRef.get<AlertsController>(AlertsController);
    app = moduleRef.createNestApplication();
  });

  it(`[GET] /alerts/:listID/dashboardData - when service return data`, async () => {
    const getData = jest.spyOn(alertsService, 'getDashboardData').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          failedGeoJSON: { features: [] },
          dissolvedGeoJSON: { features: [] },
          geojson: { features: [] },
        });
      });
    });

    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/alerts/5673/dashboardData?clientDatabase=production'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();

    expect(getData).toBeCalledTimes(1);
    expect(getData).toBeCalledWith('5673', 'production');

    await app.close();
  });

  it(`[GET] /alerts/:listID/dashboardData - dont send query param`, async () => {
    await app.init();

    const response = await request(app.getHttpServer()).get('/alerts/5673/dashboardData');
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

  it(`[GET] /alerts/:listID/GFWListDashboardData - return data`, async () => {
    await app.init();

    const getData = jest.spyOn(alertsService, 'getGFWListDashboardData').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          failedGeoJSON: { features: [] },
          dissolvedGeoJSON: { features: [] },
          geojson: { features: [] },
        });
      });
    });

    const response = await request(app.getHttpServer()).get('/alerts/5673/GFWListDashboardData');
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();

    expect(getData).toBeCalledTimes(1);
    expect(getData).toBeCalledWith('5673');

    await app.close();
  });

  it(`[GET] /alerts/:listID/GFWListDashboardDataTimestamp - when dont send the query param`, async () => {
    await app.init();

    const getData = jest
      .spyOn(alertsService, 'getGFWListDashboardTimestamp')
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({
            dashboardLastResults: new Date(),
            dashboardLastSubmit: new Date(),
          });
        });
      });

    const response = await request(app.getHttpServer()).get(
      '/alerts/5673/GFWListDashboardDataTimestamp'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();

    expect(getData).toBeCalledTimes(1);
    expect(getData).toBeCalledWith('5673');

    await app.close();
  });

  it(`[GET] /alerts/:listID/dashboardDataTimestamp - when dont send the query param`, async () => {
    await app.init();

    const response = await request(app.getHttpServer()).get('/alerts/5673/dashboardDataTimestamp');
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

  it(`[GET] /alerts/:listID/dashboardDataTimestamp - when service return data`, async () => {
    await app.init();

    const getData = jest.spyOn(alertsService, 'getDashboardTimestamp').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          dashboardLastResults: new Date(),
          dashboardLastSubmit: new Date(),
        });
      });
    });

    const response = await request(app.getHttpServer()).get(
      '/alerts/5673/dashboardDataTimestamp?clientDatabase=production'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();

    expect(getData).toBeCalledTimes(1);
    expect(getData).toBeCalledWith('5673', 'production');

    await app.close();
  });

  it(`[GET] /alerts/:listID/countDashboardData - when dont send the query param`, async () => {
    await app.init();

    const response = await request(app.getHttpServer()).get('/alerts/5673/countDashboardData');
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

  it(`[GET] /alerts/:listID/countDashboardData - when service return data`, async () => {
    await app.init();

    const getData = jest.spyOn(alertsService, 'countDashboardData').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          quantity: 1,
        });
      });
    });

    const response = await request(app.getHttpServer()).get(
      '/alerts/5673/countDashboardData?clientDatabase=production'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();

    expect(getData).toBeCalledTimes(1);
    expect(getData).toBeCalledWith('5673', 'production');

    await app.close();
  });

  it(`[GET] /alerts/:listID/dashboardDataPaginated - when dont send the query param`, async () => {
    await app.init();

    const response = await request(app.getHttpServer()).get('/alerts/5673/dashboardDataPaginated');
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
          path: ['pageNumber'],
          received: 'nan',
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

  it(`[GET] /alerts/:listID/dashboardDataPaginated - when service return data `, async () => {
    await app.init();

    const getData = jest
      .spyOn(alertsService, 'getDashboardDataPaginated')
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve([]);
        });
      });

    const response = await request(app.getHttpServer()).get(
      '/alerts/5673/dashboardDataPaginated?clientDatabase=production&pageNumber=2&rowsPerPage=50'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();

    expect(getData).toBeCalledTimes(1);
    expect(getData).toBeCalledWith('5673', 'production', '2', '50');

    await app.close();
  });
});
