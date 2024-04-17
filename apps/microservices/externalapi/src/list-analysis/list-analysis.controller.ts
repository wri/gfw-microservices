import { Controller, Get, Post, Param, Req, Body } from '@nestjs/common';
import {
  AlertsGenerateRequest,
  ListAnalysisResponse,
  UserEmailDto,
  alertsGenerateBodySchema,
  getListInfo,
  listIdSchema,
} from './list-analysis.dto';
import { ListAnalysisService } from './list-analysis.service';
import { ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { requestSchema, RequestSchema } from '../types/request-schema';
import { ZodValidationPipe } from '../middleware/zod.middleware';
import { analysisIdSchema } from '../types/analysis-id';
import { listInfoResponse } from './list-upload-new.dto';
@ApiSecurity('x-api-key')
@Controller('/v1/list')
export class ListAnalysisController {
  constructor(private readonly listAnalysisService: ListAnalysisService) {}

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
  @Get(':listId')
  async getListInfo(
    @Param('listId', new ZodValidationPipe(listIdSchema)) listId: number,
    @Body(new ZodValidationPipe(getListInfo)) listInfoDto: UserEmailDto,
    @Req() request: RequestSchema
  ): Promise<listInfoResponse> {
    const {
      user: { organizationId },
    } = request;

    return await this.listAnalysisService.getListInfo(organizationId, listId);
  }
}
