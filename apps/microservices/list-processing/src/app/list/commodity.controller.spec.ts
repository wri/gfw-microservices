// src/example/example.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { CommodityController } from './commodity.controller';
import { CommodityService } from './commodity.service';
import { BadRequestException } from '@nestjs/common';
import { CommodityResponse } from './types';

interface CommodityQueryParams {
  listId: number;
  organizationDatabase: string;
}

describe('CommodityController', () => {
  let controller: CommodityController;
  let service: CommodityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommodityController],
      providers: [
        {
          provide: CommodityService,
          useValue: {
            getCommodityFromExistingList: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommodityController>(CommodityController);
    service = module.get<CommodityService>(CommodityService);
  });

  it('should return a commodity response for valid input', async () => {
    const mockResponse: CommodityResponse = {
      commodity: 'test_commodity',
    };
    jest.spyOn(service, 'getCommodityFromExistingList').mockResolvedValue(mockResponse);

    const queryParam: CommodityQueryParams = { listId: 1, organizationDatabase: 'test_db' };
    const result = await controller.findOne(queryParam);

    expect(result).toEqual(mockResponse);
    expect(service.getCommodityFromExistingList).toHaveBeenCalledWith('test_db', 1);
  });

  it('should throw BadRequestException for invalid input', async () => {
    jest.spyOn(service, 'getCommodityFromExistingList').mockImplementation(() => {
      throw new Error('Invalid input');
    });

    const queryParam = { listId: 'invalid', organizationDatabase: 'test_db' };

    await expect(controller.findOne(queryParam as unknown as CommodityQueryParams)).rejects.toThrow(
      BadRequestException
    );
  });
});
