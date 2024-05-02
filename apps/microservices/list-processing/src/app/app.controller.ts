import { ListService } from '../services/list.service';
import {
  CopyOrMoveLargeListRequest,
  DeleteListRequest,
  RequestLargeListProcess,
  RequestPreSignedURLModel,
  RequestSaveLargeListProcessModel,
  RequestTriggerProcessLargeList,
  getNumberOfPagesPaginatedListDataRequest,
  getPaginatedListDataRequest,
} from './../models/index';
import { Controller, Post, Get, Body, Query, BadRequestException, Param } from '@nestjs/common';

import { AppService } from './app.service';
import { LocationService } from '@wri-monorepos/geo';
import { ListPaginationService } from '../services/list.pagination.service';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { deleteListBodySchema } from './types/deleteListRequestSchema';
import { RequestPreSignedURLSchema } from './validators';
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
  getObjectPresignedURL(@Body() request: Omit<RequestPreSignedURLModel, 'contentType'>) {
    return this.appService.getObjectPreSignedUrl(request.key);
  }

  @Post('/save-list-to-process')
  saveListToProcess(@Body() request: RequestSaveLargeListProcessModel) {
    return this.appService.saveListToProcess(request);
  }

  @Post('/process-list')
  processLargeList(@Body() request: RequestLargeListProcess) {
    return this.listService.startAnalisysProcessForList(request);
  }

  @Post('/create-large-list')
  triggerProcessLargeList(@Body() request: RequestTriggerProcessLargeList) {
    return this.listService.createListTables(
      request.list_name,
      request.user_id,
      request.client_database,
      request.analysisIds
    );
  }

  @Post('/CopyOrMoveLargeList')
  CopyOrMoveLargeList(@Body() request: CopyOrMoveLargeListRequest) {
    this.locationService.MoveLocations(
      request.listId,
      request.selectedListLocationClasification,
      request.customAttributesNames,
      request.userListNames,
      request.action,
      request.listType,
      request.listName,
      request.targetList,
      request.selectedLocations,
      request.addType,
      request.activeTemplate,
      request.commodityType,
      request.templateData,
      request.saveAsDraft,
      request.userId,
      request.clientDatabase,
      request.organizationId,
      request.subscriptionStatusId,
      request.gfwListId,
      request.allLocationsSelected,
      request.filters,
      request.srcListAnalysisTable
    );
    return 'processing';
  }

  @Get('/paginated-list-data')
  async getPaginatedListData(@Query() queryParam: getPaginatedListDataRequest) {
    this.validatePaginatedRequest(queryParam);
    const result = await this.listPaginationService.getPaginatedListData(queryParam);
    return result;
  }

  @Get('/pages-paginated-list-data')
  async getNumberOfPagesPaginatedListData(
    @Query() queryParam: getNumberOfPagesPaginatedListDataRequest
  ) {
    this.validatePaginatedRequest(queryParam);
    const result = await this.listPaginationService.getNumberOfPagesPaginatedListData(queryParam);
    return result;
  }

  @Get('/paginated-list-data-with-pages')
  async getPaginatedListDataWithPages(@Query() queryParam: getPaginatedListDataRequest) {
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
