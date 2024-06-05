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
import { Controller, Post, Get, Body, Query, BadRequestException, Param } from '@nestjs/common';

import { AppService } from './app.service';
import { ListService } from '../services/list.service';
import { LocationService } from './../services/locations.service';
import { ListPaginationService } from '../services/list.pagination.service';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { deleteListBodySchema } from './types/deleteListRequestSchema';
import {
  RequestPreSignedURLSchema,
  GetObjectPresignedSchema,
  RequestSaveLargeListProcessModelSchema,
  RequestLargeListProcessSchema,
  RequestTriggerProcessLargeListSchema,
  CopyOrMoveLargeListRequestSchema,
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
    protected readonly listPaginationService: ListPaginationService
  ) {}

  /**
   * Create a presigned URL to upload a file to S3
   * Send replaceFile=true to replace the file if it already exists
   * @param RequestPreSignedURLModel
   * @returns ResponsePreSignedURLModel
   */
  @Post('/create-presigned-url')
  generatePreSignedUrl(
    @Body(new ZodValidationPipe(RequestPreSignedURLSchema)) request: RequestPreSignedURLModel
  ) {
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
  getObjectPresignedURL(
    @Body(new ZodValidationPipe(GetObjectPresignedSchema)) request: GetObjectPresigned
  ) {
    return this.appService.getObjectPreSignedUrl(request.key);
  }

  @Post('/save-list-to-process')
  saveListToProcess(
    @Body(new ZodValidationPipe(RequestSaveLargeListProcessModelSchema))
    request: RequestSaveLargeListProcessModel
  ) {
    return this.listService.saveListToProcess(request);
  }

  @Post('/process-list')
  processLargeList(
    @Body(new ZodValidationPipe(RequestLargeListProcessSchema)) request: RequestLargeListProcess
  ) {
    return this.listService.startAnalysisProcessForList(request);
  }

  @Post('/create-large-list')
  triggerProcessLargeList(
    @Body(new ZodValidationPipe(RequestTriggerProcessLargeListSchema))
    request: RequestTriggerProcessLargeList
  ) {
    return this.listService.createListTables(
      request.list_name,
      request.user_id,
      request.client_database,
      request.analysisIds
    );
  }

  @Post('/CopyOrMoveLargeList')
  CopyOrMoveLargeList(
    @Body(new ZodValidationPipe(CopyOrMoveLargeListRequestSchema))
    request: CopyOrMoveLargeListRequestLLP
  ) {
    return this.locationService.MoveLocations(request);
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

  /**
   * Healthcheck for fargate
   */
  @Get('/HealthCheck')
  getHealthCheck(): string {
    return this.appService.getHealthCheck();
  }

  /**
   * Latest commit hash
   */
  @Get('/latest_commit')
  getLatestCommit(): string {
    return process.env.NODE_ENV === 'development' ? 'dev' : process.env.LATEST_COMMIT;
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
