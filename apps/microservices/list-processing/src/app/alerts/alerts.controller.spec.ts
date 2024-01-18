import * as request from 'supertest';
import { Test } from '@nestjs/testing';

import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { INestApplication } from '@nestjs/common';
import { AlertsRepository } from './alerts.repository';
import { SqlModule } from '@wri-monorepos/sql';
import { ConfigModule } from '@nestjs/config';
import { In } from 'typeorm';

describe('[GET] /analysis/alerts/:listId', () => {
  let dashboardRepository: AlertsRepository;
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule, SqlModule],
      controllers: [AlertsController],
      providers: [AlertsService, AlertsRepository],
    }).compile();

    dashboardRepository = moduleRef.get<AlertsRepository>(AlertsRepository);
    app = moduleRef.createNestApplication();
  });

  it(`when database do not have data`, async () => {
    const mockedImplementation = jest
      .spyOn(dashboardRepository, 'findAndCount')
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve([[], 0]);
        });
      });

    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/analysis/dashboard/5692?clientDatabase=production&rowsPerPage=5&page=1'
    );

    expect(mockedImplementation).toBeCalledWith('production', {
      skip: 0,
      take: '5',
      where: {
        listId: '5692',
      },
    });

    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      count: 0,
      data: [],
    });

    await app.close();
  });

  it(`when dont send queryParam`, async () => {
    await app.init();

    const response = await request(app.getHttpServer()).get('/analysis/dashboard/5692');

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
        {
          code: 'invalid_type',
          expected: 'number',
          message: 'Expected number, received nan',
          path: ['page'],
          received: 'nan',
        },
      ],
      name: 'ZodValidationError',
    });

    await app.close();
  });

  it(`when receive locationId in the query param`, async () => {
    const mockedImplementation = jest
      .spyOn(dashboardRepository, 'findAndCount')
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve([[], 0]);
        });
      });

    await app.init();

    await request(app.getHttpServer()).get(
      '/analysis/dashboard/5692?clientDatabase=production&rowsPerPage=5&page=1&locationId=1,2,3'
    );

    expect(mockedImplementation).toBeCalledWith('production', {
      skip: 0,
      take: '5',
      where: {
        listId: '5692',
        locationId: In([1, 2, 3]),
      },
    });

    await app.close();
  });

  it(`when change the page check skip amount`, async () => {
    const mockedImplementation = jest
      .spyOn(dashboardRepository, 'findAndCount')
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve([[], 0]);
        });
      });

    await app.init();

    await request(app.getHttpServer()).get(
      '/analysis/dashboard/5692?clientDatabase=production&rowsPerPage=5&page=3'
    );

    expect(mockedImplementation).toBeCalledWith('production', {
      skip: 10,
      take: '5',
      where: {
        listId: '5692',
      },
    });

    await app.close();
  });

  it(`when query param page and rowsPerPage are negative`, async () => {
    jest.spyOn(dashboardRepository, 'findAndCount').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve([[], 0]);
      });
    });

    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/analysis/dashboard/5692?clientDatabase=production&rowsPerPage=-1&page=-1'
    );

    expect(response.status).toEqual(400);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      details: [
        {
          code: 'too_small',
          exact: false,
          inclusive: true,
          message: 'rowsPerPage must be greater than 0',
          minimum: 1,
          path: ['rowsPerPage'],
          type: 'number',
        },
        {
          code: 'too_small',
          exact: false,
          inclusive: true,
          message: 'page must be greater than 0',
          minimum: 1,
          path: ['page'],
          type: 'number',
        },
      ],
      name: 'ZodValidationError',
    });

    await app.close();
  });

  it(`when database has data`, async () => {
    jest.spyOn(dashboardRepository, 'findAndCount').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve([
          [
            {
              id: 1,
              gadmId: 'BRA.1.1_1',
              locationId: 1,
              listId: 1,
              gladAlertsCoverage: '0.0',
              gladAlertsDaily: '0.0',
              gladAlertsWeekly: '0.0',
              gladAlertsMonthly: '0.0',
              viirsAlertsDaily: '0.0',
              treeCoverExtentTotal: 0,
            },
          ],
          1,
        ]);
      });
    });

    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/analysis/dashboard/5692?clientDatabase=production&rowsPerPage=5&page=1'
    );

    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      count: 1,
      data: [
        {
          gadmId: 'BRA.1.1_1',
          gladAlertsCoverage: '0.0',
          gladAlertsDaily: '0.0',
          gladAlertsMonthly: '0.0',
          gladAlertsWeekly: '0.0',
          id: 1,
          listId: 1,
          locationId: 1,
          treeCoverExtentTotal: 0,
          viirsAlertsDaily: '0.0',
        },
      ],
    });

    await app.close();
  });
});
