// src/example/example.controller.ts

import { BadRequestException, Controller, Get, Logger, Query } from '@nestjs/common';
import { CommodityService } from './commodity.service';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { ApiProperty } from '@nestjs/swagger';
import { CommodityResponse } from './types';

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

@Controller('/list/commodity')
export class CommodityController {
  private readonly logger = new Logger(CommodityController.name);

  constructor(private readonly commodityService: CommodityService) {}

  @Get()
  async findOne(
    @Query(new ZodValidationPipe(getListCommodityRequestSchema))
    queryParam: getListCommodityRequest
  ): Promise<CommodityResponse> {
    // Validate organizationDB using Zod
    try {
      const { listId, organizationDatabase } = queryParam;
      return await this.commodityService.getCommodityFromExistingList(organizationDatabase, listId);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.errors);
    }
  }
}
