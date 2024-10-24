// src/example/example.controller.ts

import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { CommodityService } from './commodity.service';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { ApiProperty } from '@nestjs/swagger';
import { ListTemplate } from '@wri-monorepos/sql';

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
  constructor(private readonly commodityService: CommodityService) {}

  @Get()
  async findOne(
    @Query(new ZodValidationPipe(getListCommodityRequestSchema))
    queryParam: getListCommodityRequest
  ): Promise<ListTemplate[]> {
    // Validate organizationDB using Zod
    try {
      console.log('queryParam:', queryParam);
    } catch (error) {
      throw new BadRequestException(error.errors);
    }
    return await this.commodityService.findAllTemplate();
  }
}
