// list-upload.controller.ts
import { Controller, Post, Body, Req, UsePipes } from '@nestjs/common';
import {
  ListUploadNewRequest,
  ListUploadNewResponse,
  ListUploadNewErrorResponse,
  PrepareUploadRequest,
} from './list-upload-new.dto';
import { ApiSecurity, ApiResponse } from '@nestjs/swagger';
import { ListAnalysisService } from './list-analysis.service';
import { PrepareUploadResponse } from './dtos';
import { requestSchema } from '../types/request-schema';
import { Request } from 'express';
import { z } from 'zod';
import { ZodValidationPipe } from '../middleware/zod.middleware';

const listUploadBodySchema = z.object({
  uploadId: z.string(),
  listName: z.string(),
  templateId: z.number(),
  analysisIDs: z.string(),
});

const prepareUploadRequestBodySchema = z.object({
  userEmail: z.string().email(),
});

@ApiSecurity('x-api-key')
@Controller('/v1')
export class ListUploadController {
  constructor (private listAnalysisService: ListAnalysisService) { }

  @ApiResponse({ status: 200, type: ListUploadNewResponse })
  @Post('/list/upload_new')
  @UsePipes(new ZodValidationPipe(listUploadBodySchema))
  async uploadNewList(
    @Body() listUpload: ListUploadNewRequest,
    @Req() request: Request
  ): Promise<ListUploadNewResponse | ListUploadNewErrorResponse> {
    const {
      user: { organizationId },
    } = requestSchema.parse(request);

    return await this.listAnalysisService.uploadNewList(listUpload, organizationId);
  }

  @ApiResponse({ status: 200, type: PrepareUploadResponse })
  @Post('/prepare_upload')
  async prepareUploadList(@Body() body: PrepareUploadRequest, @Req() request: Request) {
    const requestBodySchema = z.object({
      userEmail: z.string().email(),
    });
    const {
      user: { organizationId },
    } = requestSchema.parse(request);

    const { userEmail } = requestBodySchema.parse(body);
    return await this.listAnalysisService.prepareUpload(organizationId, userEmail);
  }
}
