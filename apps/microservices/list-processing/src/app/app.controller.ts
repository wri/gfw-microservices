import { LargeListService } from './../services/largelist.service';
import {
  CopyOrMoveLargeListRequest,
  RequestLargeListProcess,
  RequestPreSignedURLModel,
  RequestSaveLargeListProcessModel,
  RequestTriggerProcessLargeList,
  getNumberOfPagesPaginatedListDataRequest,
  getPaginatedListDataRequest,
} from './../models/index';
import { Controller, Post, Get, Body, Query, BadRequestException } from '@nestjs/common';

import { AppService } from './app.service';
import { LocationService } from '@wri-monorepos/geo';
import { ListService } from '../services/list.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly largeListService: LargeListService,
    private readonly locationService: LocationService,
    private readonly listService: ListService
  ) {}

  /**
   * Create a presigned URL to upload a file to S3
   * Send replaceFile=true to replace the file if it already exists
   * @param RequestPreSignedURLModel
   * @returns ResponsePreSignedURLModel
   */
  @Post('/create-presigned-url')
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
  getObjectPresignedURL(@Body() request: Omit<RequestPreSignedURLModel, 'contentType'>) {
    return this.appService.getObjectPreSignedUrl(request.key);
  }

  @Post('/save-list-to-process')
  saveListToProcess(@Body() request: RequestSaveLargeListProcessModel) {
    return this.appService.saveListToProcess(request);
  }

  @Post('/process-list')
  processLargeList(@Body() request: RequestLargeListProcess) {
    return this.largeListService.startAnalisysProcessForList(request);
  }

  @Post('/create-large-list')
  triggerProcessLargeList(@Body() request: RequestTriggerProcessLargeList) {
    return this.largeListService.createNewLargeListProcess(
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
    const result = await this.listService.getPaginatedListData(queryParam);
    return result;
  }

  @Get('/pages-paginated-list-data')
  async getNumberOfPagesPaginatedListData(
    @Query() queryParam: getNumberOfPagesPaginatedListDataRequest
  ) {
    this.validatePaginatedRequest(queryParam);
    const result = await this.listService.getNumberOfPagesPaginatedListData(queryParam);
    return result;
  }

  @Get('/paginated-list-data-with-pages')
  async getPaginatedListDataWithPages(@Query() queryParam: getPaginatedListDataRequest) {
    this.validatePaginatedRequest(queryParam);
    const result = this.listService.getPaginatedListDataWithPages(queryParam);
    return result;
  }

  validatePaginatedRequest(queryParam: getPaginatedListDataRequest) {
    if (queryParam.listID === undefined || queryParam.listID === null || queryParam.listID === 0) {
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
}
