// src/example/example.controller.ts

import { BadRequestException, Controller, Get, Logger, Query } from '@nestjs/common';
import { CommodityService } from './commodity.service';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { ApiProperty } from '@nestjs/swagger';
import { CommodityResponse, ListResponse } from './types'; // Assuming ListResponse is defined in types

export const getListCommodityRequestSchema = z.object({
  listId: z.coerce.number(),
  organizationDatabase: z.string(),
});

export class getListCommodityRequest {
  @ApiProperty()
  listId: number;
  @ApiProperty()
  organizationDatabase: string;
}

export const getCommodityRequestSchema = z.object({
  commodity: z.string(),
  organizationDatabase: z.string(),
});

export class getCommodityRequest {
  @ApiProperty()
  commodity: string;
  @ApiProperty()
  organizationDatabase: string;
}

@Controller('/list')
export class CommodityController {
  private readonly logger = new Logger(CommodityController.name);

  constructor(private readonly commodityService: CommodityService) {}

  @Get('/commodity')
  async findOne(
    @Query(new ZodValidationPipe(getListCommodityRequestSchema))
    queryParam: getListCommodityRequest
  ): Promise<CommodityResponse> {
    try {
      const { listId, organizationDatabase } = queryParam;
      return await this.commodityService.getCommodityFromExistingList(organizationDatabase, listId);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.errors);
    }
  }

  @Get('/by-commodity')
  async findAllByCommodity(
    @Query(new ZodValidationPipe(getCommodityRequestSchema))
    queryParam: getCommodityRequest
  ): Promise<ListResponse[]> {
    try {
      const { commodity, organizationDatabase } = queryParam;
      return await this.commodityService.getListsByCommodity(organizationDatabase, commodity);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.errors);
    }
  }
}
