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
    const expectedResult = {
      wdpaOverlapMockedData: {},
      countrySpecificDeforestationData: {},
    };

    service.handleWDPACategoryForList = jest
      .fn()
      .mockResolvedValue(expectedResult) as jest.MockedFunction<
      typeof service.handleWDPACategoryForList
    >;

    const response = await controller.getFCDCategoryDataForListId('1', 'WDPA', {
      clientDatabase: 'TestCo',
      country: 'Argentina',
      locationId: 5,
      countryGadm: 'ARG',
    });

    expect(response).toEqual(expectedResult);
    expect(service.handleWDPACategoryForList).toHaveBeenCalledWith('1', {
      clientDatabase: 'TestCo',
      country: 'Argentina',
      locationId: 5,
      countryGadm: 'ARG',
    });
  });

  it('should handle landmark category successfully', async () => {
    const landmarOverlapMockedData = {
      indigenous: 10743.949200000001,
      nonIndigenous: 14941.3889,
    };

    service.handleLandmarkCategoryForList = jest
      .fn()
      .mockResolvedValue(landmarOverlapMockedData) as jest.MockedFunction<
      typeof service.handleLandmarkCategoryForList
    >;

    const response = await controller.getFCDCategoryDataForListId('1', 'landmark', {
      clientDatabase: 'TestCo',
      country: 'Argentina',
      locationId: 3,
    });

    expect(response).toEqual(landmarOverlapMockedData);

    expect(service.handleLandmarkCategoryForList).toHaveBeenCalledWith('1', {
      clientDatabase: 'TestCo',
      country: 'Argentina',
      locationId: 3,
    });
  });

  it('should handle country category successfully', async () => {
    const mockResponse = {
      country_specific_deforestation: {},
      tree_cover_loss: {},
    };

    service.handleCountryCategoryForList = jest
      .fn()
      .mockResolvedValue(mockResponse) as jest.MockedFunction<
      typeof service.handleCountryCategoryForList
    >;

    const response = await controller.getFCDCategoryDataForListId('1', 'country', {
      clientDatabase: 'TestCo',
      countryGadm: 'ARG',
      locationId: 4,
    });

    expect(response).toEqual(mockResponse);

    expect(service.handleCountryCategoryForList).toHaveBeenCalledWith('1', {
      clientDatabase: 'TestCo',
      countryGadm: 'ARG',
      locationId: 4,
    });
  });

  it.each(['classified_region', 'random_category_param'])(
    'should throw NotImplementedException for %s category',
    async (category) => {
      await expect(
        controller.getFCDCategoryDataForListId('1', category, {
          clientDatabase: 'TestCo',
          country: 'Argentina',
          locationId: 3,
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
