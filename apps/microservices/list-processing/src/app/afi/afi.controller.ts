import { Get, Param, Query, UsePipes } from '@nestjs/common';
import { Controller, Logger } from '@nestjs/common';
import { AfiService } from './afi.service';
import { GetAfiAnalysisDataRequest } from '../../models';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';

const GetAfiAnalysisDataSchema = z.object({
  clientDatabase: z.string(),
  isListLevel: z.coerce.number().default(0),
  rowsPerPage: z.coerce.number().gte(1, 'rowsPerPage must be greater than 0'),
  pageNumber: z.coerce.number().optional(),
});

@Controller('afi')
export class AfiController {
  private readonly logger = new Logger(AfiController.name);

  constructor(private readonly afiService: AfiService) {}

  @Get('/:listId/number-of-pages')
  @UsePipes(new ZodValidationPipe(GetAfiAnalysisDataSchema))
  async getNumberOfPagesAfiAnalysis(
    @Param('listId') listId: string,
    @Query() queryParam: GetAfiAnalysisDataRequest
  ) {
    this.logger.debug('Get Number Of Pages AFI Analysis');
    const { rowsPerPage } = queryParam;

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
  @UsePipes(new ZodValidationPipe(GetAfiAnalysisDataSchema))
  async getDataAfiAnalysis(
    @Param('listId') listId: string,
    @Query() queryParam: GetAfiAnalysisDataRequest
  ) {
    this.logger.debug('Get Number Of Pages AFI Analysis');
    return await this.afiService.getAfiDataPerPage(listId, queryParam);
  }
}
