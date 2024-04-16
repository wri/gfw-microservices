import { Controller, Get, Param, Query } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { DatabaseQueryParam, PaginatedQueryRequest } from '../../models';
import { AlertsService } from './alerts.service';

const DatabaseQuerySchema = z.object({
  clientDatabase: z.string(),
});

const PaginatedQuerySchema = z.object({
  clientDatabase: z.string(),
  pageNumber: z.coerce.number().gte(1, 'Page must be greater than or equal to 1'),
  rowsPerPage: z.coerce.number().gte(1, 'Page size must be greater than or equal to 1'),
});

const GFWPaginatedQuerySchema = z.object({
  pageNumber: z.coerce.number().gte(1, 'Page must be greater than or equal to 1'),
  rowsPerPage: z.coerce.number().gte(1, 'Page size must be greater than or equal to 1'),
});

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get(':listID/dashboardData')
  async getDashboardData(
    @Param('listID') listID: number,
    @Query(new ZodValidationPipe(DatabaseQuerySchema)) query: DatabaseQueryParam
  ) {
    const { clientDatabase } = query;
    return await this.alertsService.getDashboardData(listID, clientDatabase);
  }

  @Get(':listID/GFWListDashboardData')
  async getGFWListDashboardData(@Param('listID') listID: number) {
    return await this.alertsService.getGFWListDashboardData(listID);
  }

  @Get(':listID/GFWListDashboardDataTimestamp')
  getGFWListDashboardTimestamp(@Param('listID') listID: number) {
    return this.alertsService.getGFWListDashboardTimestamp(listID);
  }

  @Get(':listID/dashboardDataTimestamp')
  getDashboardTimestamp(
    @Param('listID') listID: number,
    @Query(new ZodValidationPipe(DatabaseQuerySchema)) query: DatabaseQueryParam
  ) {
    const { clientDatabase } = query;
    return this.alertsService.getDashboardTimestamp(listID, clientDatabase);
  }

  @Get(':listID/countGFWDashboardData')
  async countGFWDashboardData(@Param('listID') listID: number) {
    return await this.alertsService.countGFWDashboardData(listID);
  }

  @Get(':listID/dashboardGFWDataPaginated')
  async getGFWDashboardDataPaginated(
    @Param('listID') listID: number,
    @Query(new ZodValidationPipe(GFWPaginatedQuerySchema)) query: PaginatedQueryRequest
  ) {
    const { pageNumber, rowsPerPage } = query;
    return await this.alertsService.getGFWDashboardDataPaginated(listID, pageNumber, rowsPerPage);
  }

  @Get(':listID/countDashboardData')
  async countDashboardData(
    @Param('listID') listID: number,
    @Query(new ZodValidationPipe(DatabaseQuerySchema)) query: DatabaseQueryParam
  ) {
    const { clientDatabase } = query;
    return await this.alertsService.countDashboardData(listID, clientDatabase);
  }

  @Get(':listID/dashboardDataPaginated')
  async getDashboardDataPaginated(
    @Param('listID') listID: number,
    @Query(new ZodValidationPipe(PaginatedQuerySchema)) query: PaginatedQueryRequest
  ) {
    const { clientDatabase, pageNumber, rowsPerPage } = query;
    return await this.alertsService.getDashboardDataPaginated(
      listID,
      clientDatabase,
      pageNumber,
      rowsPerPage
    );
  }
}
