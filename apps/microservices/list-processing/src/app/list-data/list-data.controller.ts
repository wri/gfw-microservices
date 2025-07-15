import { BadRequestException, Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import {
  getNumberOfPagesPaginatedListDataRequestSchema,
  getObjectPresignedSchema,
  getPaginatedListDataRequestSchema,
  requestPreSignedURLSchema,
} from '../validators';
import {
  getNumberOfPagesPaginatedListDataRequest,
  GetObjectPresigned,
  getPaginatedListDataRequest,
  RequestPreSignedURLModel,
} from '../../models';
import { ListDataService } from './list-data.service';
import { ListPaginationService } from './list.pagination.service';

/*
  This controller will be deprecated in the future
  We are moving this to /v1/ API routes
*/
@Controller()
export class ListDataController {
  constructor(
    private readonly listDataService: ListDataService,
    private readonly listPaginationService: ListPaginationService
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
    return this.listDataService.generatePreSignedUrl(
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
    return this.listDataService.getObjectPreSignedUrl(request.key);
  }

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
