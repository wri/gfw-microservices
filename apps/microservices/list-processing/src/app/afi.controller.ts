import { BadRequestException, Get, Param, Query } from '@nestjs/common';
import { Controller, Logger } from '@nestjs/common';
import { AfiService } from '../services/afi.service';
import { getAfiAnalysisDataRequest } from '../models';

@Controller('afi')
export class AfiController {
  private readonly logger = new Logger(AfiController.name);

  constructor(private readonly afiService: AfiService) {}

  @Get('/:listId/number-of-pages')
  async getNumberOfPagesAfiAnalysis(
    @Param('listId') listId: string,
    @Query() queryParam: getAfiAnalysisDataRequest
  ) {
    this.logger.debug('Get Number Of Pages AFI Analysis');
    const { rowsPerPage, clientDatabase } = queryParam;

    if (!listId) {
      return new BadRequestException('listId is required');
    }

    if (!rowsPerPage) {
      throw new BadRequestException('rowsPerPage is required');
    }

    if (!clientDatabase) {
      throw new BadRequestException('clientDatabase is required');
    }

    const { quantity: qtdElements } = await this.afiService.getNumberOfPagesAfiAnalysis(
      listId,
      queryParam
    );

    const pages = Math.ceil(qtdElements / rowsPerPage);

    return {
      pages: pages,
      ...queryParam,
    };
  }

  @Get('/:listId/data-per-page')
  async getDataAfiAnalysis(
    @Param('listId') listId: string,
    @Query() queryParam: getAfiAnalysisDataRequest
  ) {
    this.logger.debug('Get Number Of Pages AFI Analysis');
    const { rowsPerPage, clientDatabase, pageNumber } = queryParam;

    if (!listId) {
      return new BadRequestException('listId is required');
    }

    if (!rowsPerPage) {
      throw new BadRequestException('rowsPerPage is required');
    }

    if (!pageNumber) {
      throw new BadRequestException('pageNumber is required');
    }

    if (!clientDatabase) {
      throw new BadRequestException('clientDatabase is required');
    }

    const result = await this.afiService.getAfiDataPerPage(listId, queryParam);
    return result;
  }
}
