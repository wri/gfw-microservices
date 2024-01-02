import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { FCDService } from './fcd.service';
import { FCDController } from './fcd.controller';

describe('WDPA Overlap Country', () => {
  it(`/GET - without clientDatabase`, async () => {
    const fcdService = { getProtectedAreasByCategoryAreaData: () => [] };
    const moduleRef = await Test.createTestingModule({
      controllers: [FCDController],
      providers: [FCDService],
    })
      .overrideProvider(FCDService)
      .useValue(fcdService)
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/fcd/5692/wdpa_overlap_country/Argentina'
    );
    expect(response.status).toEqual(400);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      message: 'clientDatabase is required',
      error: 'Bad Request',
      statusCode: 400,
    });

    await app.close();
  });

  it(`/GET - data coming from service`, async () => {
    const fcdService = {
      aggregateOverlapByCountry: () => {
        return {
          FullyRestrictive: 123,
          LessRestricted: 45,
        };
      },
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [FCDController],
      providers: [FCDService],
    })
      .overrideProvider(FCDService)
      .useValue(fcdService)
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/fcd/5692/wdpa_overlap_country/Argentina?clientDatabase=production'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      FullyRestrictive: 123,
      LessRestricted: 45,
    });

    await app.close();
  });
});

describe('Landmark Overlap Country', () => {
  it(`/GET - without clientDatabase`, async () => {
    const fcdService = { getProtectedAreasByCategoryAreaData: () => [] };
    const moduleRef = await Test.createTestingModule({
      controllers: [FCDController],
      providers: [FCDService],
    })
      .overrideProvider(FCDService)
      .useValue(fcdService)
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/fcd/5692/landmark_overlap_country/Argentina'
    );
    expect(response.status).toEqual(400);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      message: 'clientDatabase is required',
      error: 'Bad Request',
      statusCode: 400,
    });

    await app.close();
  });

  it(`/GET - data coming from service`, async () => {
    const fcdService = {
      landmarkOverlapCountry: () => {
        return {
          indigenous: 123,
          nonIndegenous: 45,
        };
      },
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [FCDController],
      providers: [FCDService],
    })
      .overrideProvider(FCDService)
      .useValue(fcdService)
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get(
      '/fcd/5692/landmark_overlap_country/Argentina?clientDatabase=production'
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual({
      indigenous: 123,
      nonIndegenous: 45,
    });

    await app.close();
  });
});
