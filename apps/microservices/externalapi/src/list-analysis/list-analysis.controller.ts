import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  AlertsGenerateRequest,
  DeleteListRequest,
  ListAnalysisResponse,
  alertsGenerateBodySchema,
  deleteListBodySchema,
  listIdSchema,
  numPageSchema,
  pageSizeSchema,
  reanalyzeAnalysisBodySchema,
  requestEmailBody,
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
  ErrorResponseWithErrorMessage,
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
  @ApiResponse({ status: 422, description: 'Unprocessable Entity - Analysis limit exceeded' })
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: ErrorResponseWithErrorMessage })
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

    const errorsDetails = await this.listAnalysisService.getLocationsErrors({
      listId,
      organizationId,
      analysisId,
    });

    const combinedErrorsDetails = [...errorsDetails, ...analysisStatus.errorsDetails];

    // Check if "Exceeded Analysis Limit" is in errorsDetails and return 422
    if (combinedErrorsDetails.some((error) => error === 'Exceeded Analysis Limit')) {
      throw new HttpException(
        {
          ...analysisStatus,
          errorsDetails: combinedErrorsDetails,
        },
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    return {
      ...analysisStatus,
      errorsDetails: combinedErrorsDetails,
    };
  }
  @ApiResponse({ status: 200, type: ListAnalysisResponse })
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: NotFoundResponse })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponse })
  @Post(':listId/analysis/:analysisId/generate')
  async createAnalysisStatus(
    @Param('listId', new ZodValidationPipe(listIdSchema)) listId: number,
    @Param('analysisId', new ZodValidationPipe(analysisIdSchema)) analysisId: string,
    @Body(new ZodValidationPipe(alertsGenerateBodySchema)) alertsGenerate: AlertsGenerateRequest,
    @Req() request: RequestSchema
  ) {
    new ZodValidationPipe(requestSchema).transform(request);

    const {
      user: { organizationId },
    } = request;

    const { startDate, endDate, userEmail, outputType } = alertsGenerate;

    await this.listAnalysisService.generateDownloadBundle({
      organizationId,
      startDate,
      endDate,
      userEmail,
      listId,
      analysisId,
      outputType,
    });
  }

  @ApiResponse({ status: 200 })
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: NotFoundResponse })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponse })
  @Post(':listId/analysis/:analysisId/analyze')
  async createAnalysis(
    @Param('listId', new ZodValidationPipe(listIdSchema)) listId: number,
    @Param('analysisId', new ZodValidationPipe(analysisIdSchema)) analysisId: string,
    @Body(new ZodValidationPipe(reanalyzeAnalysisBodySchema))
    reanalyzeBody: requestEmailBody,
    @Req() request: RequestSchema
  ) {
    new ZodValidationPipe(requestSchema).transform(request);
    const { userEmail, options } = reanalyzeBody;

    // Validate that options is only used with Alerts analysis
    if (options && analysisId.toUpperCase() !== 'ALERTS') {
      throw new HttpException(
        'The "options" field can only be used when analysisId is "Alerts"',
        HttpStatus.BAD_REQUEST
      );
    }

    const {
      user: { organizationId, organization_user_id },
    } = request;
    const analysisResult = await this.listAnalysisService.createAnalysis(
      analysisId,
      listId,
      organizationId,
      userEmail,
      organization_user_id,
      options
    );
    return analysisResult;
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
  @ApiNotFoundResponse({ type: ErrorResponseWithErrorMessage })
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
  @ApiNotFoundResponse({ type: ErrorResponseWithErrorMessage })
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
