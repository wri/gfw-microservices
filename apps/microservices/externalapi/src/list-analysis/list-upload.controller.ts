// list-upload.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import {
  ListUploadNewRequest,
  ListUploadNewResponse,
  ListUploadNewErrorResponse,
  PrepareUploadRequest,
} from './list-upload-new.dto';
import { ApiSecurity, ApiResponse } from '@nestjs/swagger';
import { ListAnalysisService } from './list-analysis.service';

@ApiSecurity('x-api-key')
@Controller('/v1')
export class ListUploadController {
  constructor(private listAnalysisService: ListAnalysisService) {}

  @ApiResponse({ status: 200, type: ListUploadNewResponse })
  @Post('/list/upload_new')
  async uploadNewList(
    @Body() request: ListUploadNewRequest
  ): Promise<ListUploadNewResponse | ListUploadNewErrorResponse> {
    // Implement the logic to trigger the analysis process for the given request

    if (request.uploadId === 'invalid-id') {
      // Simulate an error response
      throw new HttpException(
        {
          errorDetails: 'Failed to process the request',
        },
        HttpStatus.BAD_REQUEST
      );
    } else {
      // Simulate a successful response
      const response: ListUploadNewResponse = {
        uploadId: request.uploadId,
        listId: 'generated-list-id',
        status: 'Completed',
        errorDetails: '',
        creationDate: '2023-09-21',
      };

      return response;
    }
  }

  @Post('/prepare_upload')
  async prepareUploadList(@Body() request: PrepareUploadRequest) {
    return await this.listAnalysisService.prepareUpload(request.userEmail);
  }
}
