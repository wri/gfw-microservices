import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { AlertsListDataRequest } from '../../models';
import { AlertsService } from './alerts.service';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { z } from 'zod';

const alertsListDataRequestSchema = z.object({
  locationId: z.string().optional(),
  clientDatabase: z.string(),
  rowsPerPage: z.coerce.number().gte(1, 'rowsPerPage must be greater than 0'),
  page: z.coerce.number().gte(1, 'page must be greater than 0'),
});

@Controller('/analysis/alerts')
export class AlertsController {
  constructor(private readonly dashboardService: AlertsService) {}

  @Get('/:listId')
  @UsePipes(new ZodValidationPipe(alertsListDataRequestSchema))
  async getDashboardListData(
    @Param('listId') listId: number,
    @Query() queryParam: AlertsListDataRequest
  ) {
    const { clientDatabase, locationId, rowsPerPage, page } = queryParam;

    return this.dashboardService.getDashboardData(
      listId,
      locationId,
      clientDatabase,
      page,
      rowsPerPage
    );
  }
}
