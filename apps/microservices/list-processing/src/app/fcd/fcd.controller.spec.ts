import { Test, TestingModule } from '@nestjs/testing';
import { FCDController } from './fcd.controller';
import { FCDService } from './fcd.service';
import { INestApplication, NotImplementedException } from '@nestjs/common';
import * as supertest from 'supertest';

describe('FCDController', () => {
  let controller: FCDController;
  let service: FCDService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FCDController],
      providers: [
        {
          provide: FCDService,
          useValue: {
            getAggregatedWDPAOverlapByCountry: jest.fn(),
            getAggregatedLandmarkOverlapByCountry: jest.fn(),
            countrySpecificDeforestation: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FCDController>(FCDController);
    service = module.get<FCDService>(FCDService);
    app = module.createNestApplication();
    await app.init();
  });

  it('should handle WDPA category successfully', async () => {
    const wdpaOverlapMockedData = {};
    const countrySpecificDeforestationData = {};

    service.getProtectedAreasByCategoryAreaData = jest
      .fn()
      .mockResolvedValue([]) as jest.MockedFunction<
      typeof service.getProtectedAreasByCategoryAreaData
    >;

    service.getAggregatedWDPAOverlapData = jest
      .fn()
      .mockReturnValue(wdpaOverlapMockedData) as jest.MockedFunction<
      typeof service.getAggregatedWDPAOverlapData
    >;

    service.getProcessedWDPACountrySpecificDeforestationYearlyData = jest
      .fn()
      .mockReturnValue(countrySpecificDeforestationData) as jest.MockedFunction<
      typeof service.getProcessedWDPACountrySpecificDeforestationYearlyData
    >;

    const response = await controller.getFCDCategoryDataForListId('1', 'WDPA', {
      clientDatabase: 'TestCo',
      country: 'Argentina',
      locationId: '5',
      countryGadm: 'ARG',
    });

    expect(response).toEqual({
      overlap: wdpaOverlapMockedData,
      country_specific_deforestation_wdpa_yearly: countrySpecificDeforestationData,
    });
    expect(service.getAggregatedWDPAOverlapData).toHaveBeenCalledWith([]);
  });

  it('should handle landmark category successfully', async () => {
    const landmarOverlapMockedData = {
      indigenous: 10743.949200000001,
      nonIndigenous: 14941.3889,
    };
    service.getAggregatedLandmarkOverlapByCountry = jest
      .fn()
      .mockResolvedValue(landmarOverlapMockedData) as jest.MockedFunction<
      typeof service.getAggregatedLandmarkOverlapByCountry
    >;

    const response = await controller.getFCDCategoryDataForListId('1', 'landmark', {
      clientDatabase: 'TestCo',
      country: 'Argentina',
      locationId: '3',
    });

    expect(response).toEqual({
      overlap: landmarOverlapMockedData,
    });
    expect(service.getAggregatedLandmarkOverlapByCountry).toHaveBeenCalledWith(
      '1',
      'Argentina',
      'TestCo',
      '3'
    );
  });

  it('should handle country category successfully', async () => {
    const mockResponse = {
      country_specific_deforestation: {},
      tree_cover_loss: {},
    };

    const listId = '1';
    const category = 'country';
    const bodyPayload = {
      clientDatabase: 'testDb',
      countryGadm: 'testGadm',
      locationId: 'testLocationId',
    };

    service.countrySpecificDeforestation = jest
      .fn()
      .mockResolvedValue(mockResponse) as jest.MockedFunction<
      typeof service.countrySpecificDeforestation
    >;

    const response = await controller.getFCDCategoryDataForListId(listId, category, bodyPayload);

    expect(response).toEqual(mockResponse);
    expect(service.countrySpecificDeforestation).toHaveBeenCalledWith(
      listId,
      bodyPayload.clientDatabase,
      bodyPayload.countryGadm,
      bodyPayload.locationId
    );
  });

  it.each(['classified_region', 'random_category_param'])(
    'should throw NotImplementedException for %s category',
    async (category) => {
      await expect(
        controller.getFCDCategoryDataForListId('1', category, {
          clientDatabase: 'TestCo',
          country: 'Argentina',
          locationId: '3',
        })
      ).rejects.toThrow(NotImplementedException);
    }
  );

  it('should respond with a validation error for missing clientDatabase', async () => {
    const response = await supertest(app.getHttpServer()).post('/fcd/1/WDPA').send({
      /* Omitting clientDatabase to trigger the validation error */
    });

    expect(response.status).toBe(400);
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
  });

  afterAll(async () => {
    await app.close();
  });
});
