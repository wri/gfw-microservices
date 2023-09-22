// list-upload.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import {
  ListUploadNewRequest,
  ListUploadNewResponse,
  ListUploadNewErrorResponse,
} from './list-upload-new.dto';

@Controller('api/v1/list-upload')
export class ListUploadController {
  @Post()
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
}
