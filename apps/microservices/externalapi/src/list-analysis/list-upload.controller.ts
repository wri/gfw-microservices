import { Controller, Post, Body, Req, UsePipes } from '@nestjs/common';
import {
  ListUploadNewRequest,
  ListUploadNewResponse,
  ListUploadNewErrorResponse,
  PrepareUploadRequest,
  prepareUploadRequestSchema,
  listUploadNewRequestSchema,
  PrepareUploadRequestSchema,
  ListUploadNewRequestSchema,
} from './list-upload-new.dto';
import { ApiSecurity, ApiResponse } from '@nestjs/swagger';
import { ListAnalysisService } from './list-analysis.service';
import { PrepareUploadResponse } from './dtos';
import { requestSchema } from '../types/request-schema';
import { Request } from 'express';
import { ZodValidationPipe } from '../middleware/zod.middleware';

@ApiSecurity('x-api-key')
@Controller('/v1')
export class ListUploadController {
  constructor(private listAnalysisService: ListAnalysisService) {}

  @ApiResponse({ status: 200, type: ListUploadNewResponse })
  @Post('/list/upload_new')
  @UsePipes(new ZodValidationPipe(listUploadNewRequestSchema))
  async uploadNewList(
    @Body() listUploadBody: ListUploadNewRequest,
    @Req() request: Request
  ): Promise<ListUploadNewResponse | ListUploadNewErrorResponse> {
    new ZodValidationPipe(requestSchema).transform(request);

    const {
      user: { organizationId },
    } = request;

    const listUpload = listUploadBody as unknown as ListUploadNewRequestSchema;

    return await this.listAnalysisService.uploadNewList(listUpload, organizationId);
  }

  @ApiResponse({ status: 200, type: PrepareUploadResponse })
  @Post('/prepare_upload')
  @UsePipes(new ZodValidationPipe(prepareUploadRequestSchema))
  async prepareUploadList(@Body() body: PrepareUploadRequest, @Req() request: Request) {
    new ZodValidationPipe(requestSchema).transform(request);

    const {
      user: { organizationId },
    } = request;

    const { userEmail, fileType } = body as PrepareUploadRequestSchema;
    return await this.listAnalysisService.prepareUpload({ organizationId, userEmail, fileType });
  }
}
