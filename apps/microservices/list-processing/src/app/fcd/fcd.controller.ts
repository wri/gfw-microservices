import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { FCDService } from './fcd.service';
import { DatabaseQueryParam } from '../../models';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';

const DatabaseQuerySchema = z.object({
  clientDatabase: z.string(),
});

@Controller('fcd')
export class FCDController {
  constructor(private readonly fcdService: FCDService) {}

  @Get('/:listId/wdpa_overlap_country/:country')
  @UsePipes(new ZodValidationPipe(DatabaseQuerySchema))
  async getAggregateOverlapByCountry(
    @Param('listId') listId: string,
    @Param('country') country: string,
    @Query() queryParam: DatabaseQueryParam
  ) {
    const { clientDatabase } = queryParam;
    return this.fcdService.aggregateOverlapByCountry(listId, country, clientDatabase);
  }

  @Get('/:listId/landmark_overlap_country/:country')
  @UsePipes(new ZodValidationPipe(DatabaseQuerySchema))
  async getLandmarkOverlapCountry(
    @Param('listId') listId: string,
    @Param('country') country: string,
    @Query() queryParam: DatabaseQueryParam
  ) {
    const { clientDatabase } = queryParam;
    return this.fcdService.landmarkOverlapCountry(listId, country, clientDatabase);
  }
}
