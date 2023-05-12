import { LargeListService } from './../services/largelist.service';
import {
  CopyOrMoveLargeListRequest,
  RequestLargeListProcess,
  RequestPreSignedURLModel,
  RequestSaveLargeListProcessModel,
  RequestTriggerProcessLargeList,
} from './../models/index';
import { Controller, Post, Get, Body } from '@nestjs/common';

import { AppService } from './app.service';
import { LocationService } from '@wri-monorepos/geo';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly largeListService: LargeListService,
    private readonly locationService: LocationService
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
   * Enpoint used to download the file in case there is a problem with the file when processing
   * @param request
   * @returns
   */
  @Post('/get-object-presigned-url')
  getObjectPresignedURL(
    @Body() request: Omit<RequestPreSignedURLModel, 'contentType'>
  ) {
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
      request.client_database
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
      request.gfwListId,
      request.allLocationsSelected,
      request.filters,
      request.srcListAnalysisTable
    );
    return 'processing';
  }

  /**
  * Healthcheck for fargate
  */
  @Get('/HealthCheck')
  getHealthCheck(): string {
    return this.appService.getHealthCheck();
  }
}
