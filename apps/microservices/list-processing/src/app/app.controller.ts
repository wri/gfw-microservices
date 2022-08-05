import {
  RequestPreSignedURLModel,
  RequestSaveLargeListProcessModel,
} from './../models/index';
import { Controller, Post, Body, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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

  @Get('/process-list')
  getTest() {
    return this.appService.getFilenameForUser('test');
  }
}
