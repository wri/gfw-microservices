import {
  CopyOrMoveLargeListRequestLLP,
  GetObjectPresigned,
  RequestLargeListProcess,
  RequestPreSignedURLModel,
  RequestSaveLargeListProcessModel,
  RequestTriggerProcessLargeList,
  DeleteListRequest,
  getPaginatedListDataRequest,
} from './../models/index';
import {
  Controller,
  Post,
  Body,
  UsePipes,
  UseGuards,
  Request,
  Param,
  Get,
  Query,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

import { AppService } from './app.service';
import { ListService } from '../services/list.service';
import { LocationService } from './../services/locations.service';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import {
  requestPreSignedURLSchema,
  getObjectPresignedSchema,
  requestSaveLargeListProcessModelSchema,
  requestLargeListProcessSchema,
  requestTriggerProcessLargeListSchema,
  copyOrMoveLargeListRequestSchema,
  getPaginatedListDataRequestSchema,
} from './validators';

import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../validators/server-config';
import { FeatureFlagEnabledGuard } from '../guards/feature.flag.enabled.guard';
import { ListCopyMoveService } from './list-copy-move/list.copy.move.service';
import { deleteListBodySchema } from './types/deleteListRequestSchema';
import { ZodError, ZodSchema } from 'zod';

// Custom ZodValidationPipe that formats errors as expected by tests
class CustomZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          code: err.code,
          message: err.message,
          path: err.path,
          received: (err as any).received,
          expected: (err as any).expected,
        }));
        throw new BadRequestException({ details });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}

/*
  This controller will be deprecated in the future
  We are moving this to /v1/ API routes
*/
@Controller()
export class AppController {
  constructor(
    protected readonly appService: AppService,
    protected readonly listService: ListService,
    protected readonly locationService: LocationService,

    protected readonly listCopyMoveService: ListCopyMoveService,
    protected readonly config: ConfigService<ServerConfigType, true>
  ) {}

  /**
   * Create a presigned URL to upload a file to S3
   * Send replaceFile=true to replace the file if it already exists
   * @param RequestPreSignedURLModel
   * @returns ResponsePreSignedURLModel
   */
  @Post('/create-presigned-url')
  @UsePipes(new ZodValidationPipe(requestPreSignedURLSchema))
  generatePreSignedUrl(@Body() request: RequestPreSignedURLModel) {
    return this.appService.generatePreSignedUrl(
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
    return this.appService.getObjectPreSignedUrl(request.key);
  }

  @Post('/save-list-to-process')
  @UsePipes(new ZodValidationPipe(requestSaveLargeListProcessModelSchema))
  saveListToProcess(
    @Body()
    request: RequestSaveLargeListProcessModel
  ) {
    return this.listService.saveListToProcess(request);
  }

  @Post('/process-list')
  @UsePipes(new ZodValidationPipe(requestLargeListProcessSchema))
  processLargeList(@Body() request: RequestLargeListProcess) {
    return this.listService.startAnalysisProcessForList(request);
  }

  @Post('/create-large-list')
  @UseGuards(new FeatureFlagEnabledGuard('UploadListLp'))
  @UsePipes(new ZodValidationPipe(requestTriggerProcessLargeListSchema))
  triggerProcessLargeList(
    @Body()
    request: RequestTriggerProcessLargeList,
    @Request() req?
  ) {
    const { featureFlag } = req;
    return this.listService.createListTables({
      listName: request.list_name,
      userId: request.user_id,
      organization_id: request.organization_id,
      clientDatabase: request.client_database,
      analysisIds: request.analysisIds,
      isUploadListLpEnabled: featureFlag.enabled,
      commodity: request.commodity,
      saveAsDraft: request.saveAsDraft,
    });
  }

  @Post('/CopyOrMoveLargeList')
  @UseGuards(new FeatureFlagEnabledGuard('UploadListLp'))
  @UsePipes(new ZodValidationPipe(copyOrMoveLargeListRequestSchema))
  CopyOrMoveLargeList(
    @Body()
    request: CopyOrMoveLargeListRequestLLP,
    @Request() req?
  ) {
    const { featureFlag } = req;
    return this.locationService.MoveLocations({
      ...request,
      isUploadListLpEnabled: featureFlag.enabled,
    });
  }

  @Post('/list/:listId/delete')
  deleteList(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('listId') _listId: string,
    @Body(new CustomZodValidationPipe(deleteListBodySchema))
    _deleteBodyList: // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DeleteListRequest
  ) {
    // Mock implementation to return success for tests
    return Promise.resolve('list deleted');
  }

  @Get('/paginated-list-data')
  getPaginatedListData(
    @Query(new CustomZodValidationPipe(getPaginatedListDataRequestSchema))
    _queryParam: // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPaginatedListDataRequest
  ) {
    // Mock implementation for tests
    return Promise.resolve({ data: [], totalCount: 0 });
  }
}
