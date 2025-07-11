import { Body, Controller, Post, UsePipes, Param } from '@nestjs/common';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import {
  requestLargeListProcessSchema,
  requestSaveLargeListProcessModelSchema,
  requestTriggerProcessLargeListSchema,
} from '../validators';
import {
  DeleteListRequest,
  RequestLargeListProcess,
  RequestSaveLargeListProcessModel,
  RequestTriggerProcessLargeList,
} from '../../models';
import { SaveListToProcessService } from './save.list.to.process.service';
import { StartAnalysisService } from './start.analysis.service';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { CreateLargeListService } from './create.large.list.service';
import { DeleteListService } from './delete.list.service';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { deleteListBodySchema } from '../types/deleteListRequestSchema';
import { BadRequestExceptionResponse } from '../types/apiResponses';

@Controller()
export class ListUploadController {
  constructor(
    private readonly config: ConfigService<ServerConfigType, true>,
    private readonly saveListToProcessService: SaveListToProcessService,
    private readonly startAnalysisService: StartAnalysisService,
    private readonly createLargeListService: CreateLargeListService,

    private readonly deleteListService: DeleteListService
  ) {}

  @Post('/save-list-to-process')
  @UsePipes(new ZodValidationPipe(requestSaveLargeListProcessModelSchema))
  saveListToProcess(
    @Body()
    request: RequestSaveLargeListProcessModel
  ) {
    return this.saveListToProcessService.run(request);
  }

  @Post('/process-list')
  @UsePipes(new ZodValidationPipe(requestLargeListProcessSchema))
  processLargeList(@Body() request: RequestLargeListProcess) {
    const bucket = this.config.get('LARGE_PROCESSING_LIST_BUCKET', { infer: true });
    request.path = request.path.replace(`s3://${bucket}/`, '');
    return this.startAnalysisService.run(request);
  }

  @Post('/create-large-list')
  @UsePipes(new ZodValidationPipe(requestTriggerProcessLargeListSchema))
  async triggerProcessLargeList(
    @Body()
    request: RequestTriggerProcessLargeList
  ) {
    return await this.createLargeListService.run({
      listName: request.list_name,
      userId: request.user_id,
      organization_id: request.organization_id,
      clientDatabase: request.client_database,
      analysisIds: request.analysisIds,
      commodity: request.commodity,
      saveAsDraft: request.saveAsDraft,
    });
  }

  @ApiResponse({ status: 200, type: String })
  @ApiNotFoundResponse({ status: 404, type: BadRequestExceptionResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Post('/list/:listId/delete')
  deleteList(
    @Param('listId') listId: number,
    @Body(new ZodValidationPipe(deleteListBodySchema)) deleteBodyList: DeleteListRequest
  ): Promise<string> {
    const { organizationDatabase, organization_user_id, userEmail } = deleteBodyList;
    return this.deleteListService.run(
      listId,
      organizationDatabase,
      organization_user_id,
      userEmail
    );
  }
}
