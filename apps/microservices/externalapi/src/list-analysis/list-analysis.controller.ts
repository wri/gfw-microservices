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
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { requestSchema, RequestSchema } from '../types/request-schema';
import { ZodValidationPipe } from '../middleware/zod.middleware';
import { analysisIdSchema } from '../types/analysis-id';
import { ListInfoResponse } from './list-upload-new.dto';
import {
  UnauthorizedResponse,
  NotFoundResponse,
  ForbiddenResponse,
  BadRequestResponse,
  ErroResponseWithErroMessage,
  DeleteListMessageResponse,
  InternalServerErrorResponse,
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
  @ApiNotFoundResponse({ type: ErroResponseWithErroMessage })
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
  @ApiResponse({ status: 200, type: ListAnalysisResponse })
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: NotFoundResponse })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponse })
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
  @ApiResponse({ status: 200, type: DeleteListMessageResponse })
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: NotFoundResponse })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponse })
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

    const message = await this.listAnalysisService.deleteList(listId, organizationId, userEmail);
    return { message };
  }
  @ApiResponse({ status: 200, type: ListInfoResponse })
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: ErroResponseWithErroMessage })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponse })
  @Get(':listId')
  async getListInfo(
    @Param('listId', new ZodValidationPipe(listIdSchema)) listId: number,
    @Req() request: RequestSchema
  ): Promise<ListInfoResponse> {
    const {
      user: { organizationId },
    } = request;

    return await this.list.getListInfo(organizationId, listId);
  }

  @Get()
  @ApiResponse({
    description: 'Paginated info List',
    status: 200,
    type: ListInfoResponse,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: ErroResponseWithErroMessage })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponse })
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
