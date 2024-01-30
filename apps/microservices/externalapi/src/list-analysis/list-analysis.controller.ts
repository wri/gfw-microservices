import { Controller, Get, Param, Req } from '@nestjs/common';
import { ListAnalysisResponse } from './list-analysis.dto';
import { ListAnalysisService } from './list-analysis.service';
import { ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { requestSchema, RequestSchema } from '../types/request-schema';
import { z } from 'zod';
import { ZodValidationPipe } from '../middleware/zod.middleware';

const listIdSchema = z.coerce.number();
const analysisIdSchema = z.enum(['ALERTS', 'FCD']);

@ApiSecurity('x-api-key')
@Controller('/v1/list')
export class ListAnalysisController {
  constructor(private readonly listAnalysisService: ListAnalysisService) {}

  @ApiResponse({ status: 200, type: ListAnalysisResponse })
  @Get(':listId/analysis/:analysisId/status')
  async getAnalysisStatus(
    @Param('listId', new ZodValidationPipe(listIdSchema)) listId: number,
    @Param('analysisId', new ZodValidationPipe(analysisIdSchema)) analysisId: string,
    @Req() request: RequestSchema
  ): Promise<ListAnalysisResponse> {
    new ZodValidationPipe(requestSchema).transform(request);

    const {
      user: { organizationId },
    } = request;

    const analysisStatus = await this.listAnalysisService.getAnalysisStatus({
      organizationId,
      listId,
      analysisId,
    });

    return analysisStatus;
  }
}
