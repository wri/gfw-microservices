import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { FCDService } from './fcd.service';
import { DatabaseQueryParam } from '../../models';

@Controller('fcd')
export class FCDController {
  constructor(private readonly fcdService: FCDService) {}

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

    const result = this.fcdService.aggregateOverlapByCountry(listId, country, clientDatabase);
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

    const result = this.fcdService.landmarkOverlapCountry(listId, country, clientDatabase);
    return result;
  }
}
