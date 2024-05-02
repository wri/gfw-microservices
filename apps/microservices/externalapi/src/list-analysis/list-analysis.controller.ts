import { Controller, Get, Post, Param, Req, Body, Delete } from '@nestjs/common';
import {
  AlertsGenerateRequest,
  DeleteListRequest,
  ListAnalysisResponse,
  alertsGenerateBodySchema,
  deleteListBodySchema,
  listIdSchema,
} from './list-analysis.dto';
import { ListService } from '../lists/lists.service';
import { ListAnalysisService } from './list-analysis.service';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { requestSchema, RequestSchema } from '../types/request-schema';
import { ZodValidationPipe } from '../middleware/zod.middleware';
import { analysisIdSchema } from '../types/analysis-id';
import { listInfoResponse } from './list-upload-new.dto';
import {
  UnauthorizedResponse,
  NotFoundResponse,
  ForbiddenResponse,
  BadRequestResponse,
} from './dtos/apiResponse';
@ApiSecurity('x-api-key')
@Controller('/v1/list')
export class ListAnalysisController {
  constructor(
    private readonly listAnalysisService: ListAnalysisService,
    private readonly list: ListService
  ) {}

  @ApiResponse({ status: 200, type: ListAnalysisResponse })
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: NotFoundResponse })
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
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: NotFoundResponse })
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
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: NotFoundResponse })
  @Delete(':listId')
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
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: NotFoundResponse })
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
}
