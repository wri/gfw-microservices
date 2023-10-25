import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { WDPAService } from '../services/wdpa.service';
import { DatabaseQueryParam } from '../models';

@Controller('fcd')
export class WDPAController {
  constructor(private readonly wdpaService: WDPAService) {}

  @Get('/:listId/wdpa_overlap_country/:country')
  async getAggregateOverlapByCountry(
    @Param('listId') listId: string,
    @Param('country') country: string,
    @Query() queryParam: DatabaseQueryParam
  ) {
    const { clientDatabase } = queryParam;

    if (!clientDatabase) {
      throw new BadRequestException('clientDatabase is required');
    }

    const result = this.wdpaService.aggregateOverlapByCountry(listId, country, clientDatabase);
    return result;
  }

  @Get('/:listId/landmark_overlap_country/:country')
  async getLandmarkOverlapCountry(
    @Param('listId') listId: string,
    @Param('country') country: string,
    @Query() queryParam: DatabaseQueryParam
  ) {
    const { clientDatabase } = queryParam;

    if (!clientDatabase) {
      throw new BadRequestException('clientDatabase is required');
    }

    const result = this.wdpaService.landmarkOverlapCountry(listId, country, clientDatabase);
    return result;
  }
}
