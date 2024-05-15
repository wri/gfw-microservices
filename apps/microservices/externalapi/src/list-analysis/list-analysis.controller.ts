import { Controller, Get, Post, Param, Req, Body, Query } from '@nestjs/common';
import {
  AlertsGenerateRequest,
  DeleteListRequest,
  ListAnalysisResponse,
  alertsGenerateBodySchema,
  deleteListBodySchema,
  listIdSchema,
  numPageSchema,
  pageSizeSchema,
} from './list-analysis.dto';
import { ListService } from '../lists/lists.service';
import { ListAnalysisService } from './list-analysis.service';
import { ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { requestSchema, RequestSchema } from '../types/request-schema';
import { ZodValidationPipe } from '../middleware/zod.middleware';
import { analysisIdSchema } from '../types/analysis-id';
import { listInfoResponse } from './list-upload-new.dto';
@ApiSecurity('x-api-key')
@Controller('/v1/list')
export class ListAnalysisController {
  constructor(
    private readonly listAnalysisService: ListAnalysisService,
    private readonly list: ListService
  ) {}

  @ApiResponse({ status: 200, type: ListAnalysisResponse })
  @Get(':listId/analysis/:analysisId/status')
  async getAnalysisStatus(
    @Param('listId', new ZodValidationPipe(listIdSchema)) listId: number,
    @Param('analysisId', new ZodValidationPipe(analysisIdSchema)) analysisId: string,
    @Req() request: RequestSchema
  ): Promise<ListAnalysisResponse> {
    new ZodValidationPipe(requestSchema).transform(request);
    const {
      user: { organizationId },
    } = request;

    const analysisStatus = await this.listAnalysisService.getAnalysisStatusWithErrorFileStoragePath(
      {
        organizationId,
        listId,
        analysisId,
      }
    );

    return analysisStatus;
  }

  @Post(':listId/analysis/Alerts/generate')
  async createAnalysisStatus(
    @Param('listId', new ZodValidationPipe(listIdSchema)) listId: number,
    @Body(new ZodValidationPipe(alertsGenerateBodySchema)) alertsGenerate: AlertsGenerateRequest,
    @Req() request: RequestSchema
  ) {
    new ZodValidationPipe(requestSchema).transform(request);

    const {
      user: { organizationId },
    } = request;

    const { startDate, endDate, userEmail } = alertsGenerate;

    await this.listAnalysisService.generateAlert({
      organizationId,
      startDate,
      endDate,
      userEmail,
      listId,
    });
  }
  @Post(':listId/delete')
  async deleteList(
    @Param('listId', new ZodValidationPipe(listIdSchema)) listId: number,
    @Body(new ZodValidationPipe(deleteListBodySchema)) deleteBodyList: DeleteListRequest,
    @Req() request: RequestSchema
  ) {
    new ZodValidationPipe(requestSchema).transform(request);
    const {
      user: { organizationId },
    } = request;
    const { userEmail } = deleteBodyList;
    return await this.listAnalysisService.deleteList(listId, organizationId, userEmail);
  }
  @Get(':listId')
  async getListInfo(
    @Param('listId', new ZodValidationPipe(listIdSchema)) listId: number,
    @Req() request: RequestSchema
  ): Promise<listInfoResponse> {
    const {
      user: { organizationId },
    } = request;

    return await this.list.getListInfo(organizationId, listId);
  }

  @Get()
  async getPaginatedLists(
    @Query('pageSize', new ZodValidationPipe(pageSizeSchema)) pageSize: number,
    @Query('pageNum', new ZodValidationPipe(numPageSchema)) pageNum: number,
    @Req() request: RequestSchema
  ) {
    const {
      user: { organizationId },
    } = request;
    return await this.list.getPaginatedListInfo(pageSize, pageNum, organizationId);
  }
}
