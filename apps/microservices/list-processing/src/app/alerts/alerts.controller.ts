import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { DatabaseQueryParam, PaginatedQuerySchema } from '../../models';
import { AlertsService } from './alerts.service';

const DatabaseQuerySchema = z.object({
  clientDatabase: z.string(),
});

const PaginatedQuerySchema = z.object({
  clientDatabase: z.string(),
  pageNumber: z.coerce.number().gte(1, 'Page must be greater than or equal to 1'),
  rowsPerPage: z.coerce.number().gte(1, 'Page size must be greater than or equal to 1'),
});

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get(':listID/dashboardData')
  @UsePipes(new ZodValidationPipe(DatabaseQuerySchema))
  async getDashboardData(@Param('listID') listID: number, @Query() query: DatabaseQueryParam) {
    const { clientDatabase } = query;
    return await this.alertsService.getDashboardData(listID, clientDatabase);
  }

  @Get(':listID/GFWListDashboardData')
  @UsePipes(new ZodValidationPipe(DatabaseQuerySchema))
  async getGFWListDashboardData(@Param('listID') listID: number) {
    return await this.alertsService.getGFWListDashboardData(listID);
  }

  @Get(':listID/GFWListDashboardDataTimestamp')
  getGFWListDashboardTimestamp(@Param('listID') listID: number) {
    return this.alertsService.getGFWListDashboardTimestamp(listID);
  }

  @Get(':listID/dashboardDataTimestamp')
  @UsePipes(new ZodValidationPipe(DatabaseQuerySchema))
  getDashboardTimestamp(@Param('listID') listID: number, @Query() query: DatabaseQueryParam) {
    const { clientDatabase } = query;
    return this.alertsService.getDashboardTimestamp(listID, clientDatabase);
  }
}
