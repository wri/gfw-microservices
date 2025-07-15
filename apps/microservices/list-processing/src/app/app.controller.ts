import {
  CopyOrMoveLargeListRequestLLP,
  DeleteListRequest,
  GetObjectPresigned,
  RequestLargeListProcess,
  RequestPreSignedURLModel,
  RequestSaveLargeListProcessModel,
  RequestTriggerProcessLargeList,
  getNumberOfPagesPaginatedListDataRequest,
  getPaginatedListDataRequest,
} from './../models/index';
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  BadRequestException,
  Param,
  UsePipes,
  UseGuards,
  Request,
} from '@nestjs/common';

import { AppService } from './app.service';
import { ListService } from '../services/list.service';
import { LocationService } from './../services/locations.service';
import { ListPaginationService } from '../services/list.pagination.service';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { deleteListBodySchema } from './types/deleteListRequestSchema';
import {
  requestPreSignedURLSchema,
  getObjectPresignedSchema,
  requestSaveLargeListProcessModelSchema,
  requestLargeListProcessSchema,
  requestTriggerProcessLargeListSchema,
  copyOrMoveLargeListRequestSchema,
  getPaginatedListDataRequestSchema,
  getNumberOfPagesPaginatedListDataRequestSchema,
} from './validators';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BadRequestExceptionResponse } from './types/apiResponses';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../validators/server-config';
import { FeatureFlagEnabledGuard } from '../guards/feature.flag.enabled.guard';
import { ListCopyMoveService } from './list-copy-move/list.copy.move.service';

/*
  This controller will be deprecated in the future
  We are moving this to /v1/ API routes
*/
@Controller()
export class AppController {
  constructor(
    protected readonly appService: AppService,
    protected readonly listService: ListService,
    protected readonly locationService: LocationService,
    protected readonly listPaginationService: ListPaginationService,

    protected readonly listCopyMoveService: ListCopyMoveService,
    protected readonly config: ConfigService<ServerConfigType, true>
  ) {}

  /**
   * Create a presigned URL to upload a file to S3
   * Send replaceFile=true to replace the file if it already exists
   * @param RequestPreSignedURLModel
   * @returns ResponsePreSignedURLModel
   */
  @Post('/create-presigned-url')
  @UsePipes(new ZodValidationPipe(requestPreSignedURLSchema))
  generatePreSignedUrl(@Body() request: RequestPreSignedURLModel) {
    return this.appService.generatePreSignedUrl(
      request.key,
      request.contentType,
      request.replaceFile
    );
  }

  /**
   * Endpoint used to download the file in case there is a problem with the file when processing
   * @param request
   * @returns
   */
  @Post('/get-object-presigned-url')
  @UsePipes(new ZodValidationPipe(getObjectPresignedSchema))
  getObjectPresignedURL(@Body() request: GetObjectPresigned) {
    return this.appService.getObjectPreSignedUrl(request.key);
  }

  @Post('/save-list-to-process')
  @UsePipes(new ZodValidationPipe(requestSaveLargeListProcessModelSchema))
  saveListToProcess(
    @Body()
    request: RequestSaveLargeListProcessModel
  ) {
    return this.listService.saveListToProcess(request);
  }

  @Post('/process-list')
  @UsePipes(new ZodValidationPipe(requestLargeListProcessSchema))
  processLargeList(@Body() request: RequestLargeListProcess) {
    return this.listService.startAnalysisProcessForList(request);
  }

  @Post('/create-large-list')
  @UseGuards(new FeatureFlagEnabledGuard('UploadListLp'))
  @UsePipes(new ZodValidationPipe(requestTriggerProcessLargeListSchema))
  triggerProcessLargeList(
    @Body()
    request: RequestTriggerProcessLargeList,
    @Request() req?
  ) {
    const { featureFlag } = req;
    return this.listService.createListTables({
      listName: request.list_name,
      userId: request.user_id,
      organization_id: request.organization_id,
      clientDatabase: request.client_database,
      analysisIds: request.analysisIds,
      isUploadListLpEnabled: featureFlag.enabled,
      commodity: request.commodity,
      saveAsDraft: request.saveAsDraft,
    });
  }

  @Post('/CopyOrMoveLargeList')
  @UseGuards(new FeatureFlagEnabledGuard('UploadListLp'))
  @UsePipes(new ZodValidationPipe(copyOrMoveLargeListRequestSchema))
  CopyOrMoveLargeList(
    @Body()
    request: CopyOrMoveLargeListRequestLLP,
    @Request() req?
  ) {
    const { featureFlag } = req;
    return this.locationService.MoveLocations({
      ...request,
      isUploadListLpEnabled: featureFlag.enabled,
    });
  }

  @Get('/paginated-list-data')
  async getPaginatedListData(
    @Query(new ZodValidationPipe(getPaginatedListDataRequestSchema))
    queryParam: getPaginatedListDataRequest
  ) {
    this.validatePaginatedRequest(queryParam);
    const result = await this.listPaginationService.getPaginatedListData(queryParam);
    return result;
  }

  @Get('/pages-paginated-list-data')
  async getNumberOfPagesPaginatedListData(
    @Query(new ZodValidationPipe(getNumberOfPagesPaginatedListDataRequestSchema))
    queryParam: getNumberOfPagesPaginatedListDataRequest
  ) {
    this.validatePaginatedRequest(queryParam);
    const result = await this.listPaginationService.getNumberOfPagesPaginatedListData(queryParam);
    return result;
  }

  @Get('/paginated-list-data-with-pages')
  async getPaginatedListDataWithPages(
    @Query(new ZodValidationPipe(getPaginatedListDataRequestSchema))
    queryParam: getPaginatedListDataRequest
  ) {
    this.validatePaginatedRequest(queryParam);
    const result = this.listPaginationService.getPaginatedListDataWithPages(queryParam);
    return result;
  }

  validatePaginatedRequest(queryParam: getPaginatedListDataRequest) {
    if (queryParam.listId === undefined || queryParam.listId === null || queryParam.listId === 0) {
      throw new BadRequestException('listID is required');
    }

    if (
      queryParam.organizationDatabase === undefined ||
      queryParam.organizationDatabase === null ||
      queryParam.organizationDatabase === ''
    ) {
      throw new BadRequestException('organizationDatabase is required');
    }
  }

  @ApiResponse({ status: 200, type: String })
  @ApiNotFoundResponse({ status: 404, type: BadRequestExceptionResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Post('/list/:listId/delete')
  deleteList(
    @Param('listId') listId: number,
    @Body(new ZodValidationPipe(deleteListBodySchema)) deleteBodyList: DeleteListRequest
  ): Promise<string> {
    const { organizationDatabase, organization_user_id, userEmail } = deleteBodyList;
    return this.appService.deleteList(
      listId,
      organizationDatabase,
      organization_user_id,
      userEmail
    );
  }
}
