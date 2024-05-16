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
import {
  ApiSecurity,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ListAnalysisService } from './list-analysis.service';
import { PrepareUploadResponse } from './dtos';
import { requestSchema } from '../types/request-schema';
import { Request } from 'express';
import { ZodValidationPipe } from '../middleware/zod.middleware';
import {
  BadRequestResponse,
  ForbiddenResponse,
  InternalServerErrorResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from './dtos/apiResponse';

@ApiSecurity('x-api-key')
@Controller('/v1')
export class ListUploadController {
  constructor(private listAnalysisService: ListAnalysisService) {}

  @ApiResponse({ status: 200, type: ListUploadNewResponse })
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: NotFoundResponse })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponse })
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
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: NotFoundResponse })
  @Post('/prepare_upload')
  @UsePipes(new ZodValidationPipe(prepareUploadRequestSchema))
  // We must require the userEmail from the user to validate it in the API middleware
  async prepareUploadList(@Body() body: PrepareUploadRequest, @Req() request: Request) {
    new ZodValidationPipe(requestSchema).transform(request);

    const {
      user: { organizationId, organization_user_id },
    } = request;

    const { fileType } = body as PrepareUploadRequestSchema;
    return await this.listAnalysisService.prepareUpload({
      organizationId,
      organization_user_id,
      fileType,
    });
  }
}
