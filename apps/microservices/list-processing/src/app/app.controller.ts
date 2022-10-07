import { LargeListService } from './../services/largelist.service';
import {
  RequestLargeListProcess,
  RequestPreSignedURLModel,
  RequestSaveLargeListProcessModel,
  RequestTriggerProcessLargeList,
} from './../models/index';
import { Controller, Post, Body, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly largeListService: LargeListService
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
}
