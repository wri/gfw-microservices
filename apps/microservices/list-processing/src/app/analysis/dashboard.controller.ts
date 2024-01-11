import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { GetDashboardListDataRequest } from '../../models';
import { DashboardService } from './dashboard.service';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { z } from 'zod';

const getDashboardListDataSchema = z.object({
  locationId: z.string().optional(),
  clientDatabase: z.string(),
  rowsPerPage: z.string().transform((v) => parseInt(v)),
  page: z.string().transform((v) => parseInt(v)),
});

@Controller('/analysis/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/:listId')
  @UsePipes(new ZodValidationPipe(getDashboardListDataSchema))
  async getDashboardListData(
    @Param('listId') listId: number,
    @Query() queryParam: GetDashboardListDataRequest
  ) {
    const { clientDatabase, locationId, rowsPerPage, page } = queryParam;

    const locationIdArray = this.transformLocationId(locationId);

    return this.dashboardService.getDashboardData(
      listId,
      locationIdArray,
      clientDatabase,
      page,
      rowsPerPage
    );
  }

  transformLocationId(locationId = ''): Array<number> {
    let locationIdArray = [];
    locationIdArray = locationId.split(',');
    locationIdArray = locationIdArray.reduce((acc, item) => {
      const value = parseInt(item, 10);
      if (!isNaN(value)) {
        acc.push(value);
      }
      return acc;
    }, []);
    return locationIdArray;
  }
}
