// list-upload.controller.ts
import { Controller, Post, Body, Req } from '@nestjs/common';
import {
  ListUploadNewRequest,
  ListUploadNewResponse,
  ListUploadNewErrorResponse,
  PrepareUploadRequest,
} from './list-upload-new.dto';
import { ApiSecurity, ApiResponse } from '@nestjs/swagger';
import { ListAnalysisService } from './list-analysis.service';
import { PrepareUploadResponse } from './dtos';
import { Request } from 'express';
@ApiSecurity('x-api-key')
@Controller('/v1')
export class ListUploadController {
  constructor(private listAnalysisService: ListAnalysisService) {}

  @ApiResponse({ status: 200, type: ListUploadNewResponse })
  @Post('/list/upload_new')
  async uploadNewList(
    @Body() listUploadRequest: ListUploadNewRequest,
    @Req() request: Request
  ): Promise<ListUploadNewResponse | ListUploadNewErrorResponse> {
    const organizationId = request.user.organizationId ?? 0;
    return await this.listAnalysisService.uploadNewList(listUploadRequest, organizationId);
  }

  @ApiResponse({ status: 200, type: PrepareUploadResponse })
  @Post('/prepare_upload')
  async prepareUploadList(@Body() request: PrepareUploadRequest) {
    return await this.listAnalysisService.prepareUpload(request.userEmail);
  }
}
