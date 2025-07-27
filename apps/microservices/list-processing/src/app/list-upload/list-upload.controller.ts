import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import {
  getObjectPresignedSchema,
  requestLargeListProcessSchema,
  requestPreSignedURLSchema,
  requestSaveLargeListProcessModelSchema,
  requestTriggerProcessLargeListSchema,
} from '../validators';
import {
  GetObjectPresigned,
  RequestLargeListProcess,
  RequestPreSignedURLModel,
  RequestSaveLargeListProcessModel,
  RequestTriggerProcessLargeList,
} from '../../models';
import { ListUploadService } from './list-upload.service';

@Controller()
export class ListUploadController {
  constructor(private readonly listUploadService: ListUploadService) {}

  /**
   * Create a presigned URL to upload a file to S3
   * Send replaceFile=true to replace the file if it already exists
   * @param RequestPreSignedURLModel
   * @returns ResponsePreSignedURLModel
   */
  @Post('/create-presigned-url')
  @UsePipes(new ZodValidationPipe(requestPreSignedURLSchema))
  generatePreSignedUrl(@Body() request: RequestPreSignedURLModel) {
    return this.listUploadService.generatePreSignedUrl(
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
    return this.listUploadService.getObjectPreSignedUrl(request.key);
  }

  @Post('/save-list-to-process')
  @UsePipes(new ZodValidationPipe(requestSaveLargeListProcessModelSchema))
  saveListToProcess(
    @Body()
    request: RequestSaveLargeListProcessModel
  ) {
    return this.listUploadService.saveListToProcess(request);
  }

  @Post('/process-list')
  @UsePipes(new ZodValidationPipe(requestLargeListProcessSchema))
  processLargeList(@Body() request: RequestLargeListProcess) {
    return this.listUploadService.startAnalysisProcessForList(request);
  }

  @Post('/create-large-list')
  @UsePipes(new ZodValidationPipe(requestTriggerProcessLargeListSchema))
  triggerProcessLargeList(
    @Body()
    request: RequestTriggerProcessLargeList
  ) {
    return this.listUploadService.createListTables({
      listName: request.list_name,
      userId: request.user_id,
      organization_id: request.organization_id,
      clientDatabase: request.client_database,
      analysisIds: request.analysisIds,
      commodity: request.commodity,
      saveAsDraft: request.saveAsDraft,
    });
  }
}
