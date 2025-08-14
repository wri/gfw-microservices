import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import {
  DeleteListRequest,
  getNumberOfPagesPaginatedListDataRequest,
  getPaginatedListDataRequest,
} from '../../models';
import {
  getNumberOfPagesPaginatedListDataRequestSchema,
  getPaginatedListDataRequestSchema,
} from '../validators';
import { ListPaginationService } from './list.pagination.service';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BadRequestExceptionResponse } from '../types/apiResponses';
import { deleteListBodySchema } from '../types/deleteListRequestSchema';
import { DeleteListService } from './delete.list.service';

@Controller()
export class ListController {
  constructor(
    private readonly listPaginationService: ListPaginationService,
    private readonly deleteListService: DeleteListService
  ) {}

  @Get('/paginated-list-data')
  async getPaginatedListData(
    @Query(new ZodValidationPipe(getPaginatedListDataRequestSchema))
    queryParam: getPaginatedListDataRequest
  ) {
    this.validatePaginatedRequest(queryParam);
    const result = await this.listPaginationService.getPaginatedListData(queryParam);
    return result;
  }

  @Get('/pages-paginated-list-data')
  async getNumberOfPagesPaginatedListData(
    @Query(new ZodValidationPipe(getNumberOfPagesPaginatedListDataRequestSchema))
    queryParam: getNumberOfPagesPaginatedListDataRequest
  ) {
    this.validatePaginatedRequest(queryParam);
    const result = await this.listPaginationService.getNumberOfPagesPaginatedListData(queryParam);
    return result;
  }

  @Get('/paginated-list-data-with-pages')
  async getPaginatedListDataWithPages(
    @Query(new ZodValidationPipe(getPaginatedListDataRequestSchema))
    queryParam: getPaginatedListDataRequest
  ) {
    this.validatePaginatedRequest(queryParam);
    const result = this.listPaginationService.getPaginatedListDataWithPages(queryParam);
    return result;
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
    const { organizationDatabase, organization_user_id } = deleteBodyList;
    return this.deleteListService.run(listId, organizationDatabase, organization_user_id);
  }

  validatePaginatedRequest(queryParam: getPaginatedListDataRequest) {
    if (queryParam.listId === undefined || queryParam.listId === null || queryParam.listId === 0) {
      throw new BadRequestException('listID is required');
    }

    if (
      queryParam.organizationDatabase === undefined ||
      queryParam.organizationDatabase === null ||
      queryParam.organizationDatabase === ''
    ) {
      throw new BadRequestException('organizationDatabase is required');
    }
  }
}
