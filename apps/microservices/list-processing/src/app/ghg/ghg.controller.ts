import { Get, Param, Query } from '@nestjs/common';
import { Controller, Logger } from '@nestjs/common';
import { GHGService } from './ghg.service';
import { GetGHGAnalysisDataRequest } from '../../models';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';

const GetGHGAnalysisDataSchema = z.object({
  clientDatabase: z.string(),
  rowsPerPage: z.coerce.number().gte(1, 'rowsPerPage must be greater than 0'),
  pageNumber: z.coerce.number().optional(),
});

@Controller('ghg')
export class GHGController {
  private readonly logger = new Logger(GHGController.name);

  constructor(private readonly ghgService: GHGService) {}

  @Get('/:listId/number-of-pages')
  async getNumberOfPagesAfiAnalysis(
    @Param('listId') listId: string,
    @Query(new ZodValidationPipe(GetGHGAnalysisDataSchema)) queryParam: GetGHGAnalysisDataRequest
  ) {
    this.logger.debug('Get Number Of Pages AFI Analysis');
    const { rowsPerPage } = queryParam;

    const { quantity: qtdElements } = await this.ghgService.getNumberOfPagesGHGAnalysis(
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
    @Query(new ZodValidationPipe(GetGHGAnalysisDataSchema)) queryParam: GetGHGAnalysisDataRequest
  ) {
    this.logger.debug('Get Number Of Pages AFI Analysis');
    return await this.ghgService.getGHGDataPerPage(listId, queryParam);
  }
}