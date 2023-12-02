import { Controller, Get, Param, Req, UsePipes } from '@nestjs/common';
import { ListAnalysisResponse } from './list-analysis.dto';
import { ListAnalysisService } from './list-analysis.service';
import { ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { requestSchema, RequestSchema } from '../types/request-schema';
import { z } from 'zod';
import { ZodValidationPipe } from '../middleware/zod.middleware';

@ApiSecurity('x-api-key')
@Controller('/v1/list')
export class ListAnalysisController {
  constructor (private readonly listAnalysisService: ListAnalysisService) { }

  @ApiResponse({ status: 200, type: ListAnalysisResponse })
  @Get(':listID/analysis/FCD/status')
  @UsePipes(new ZodValidationPipe(z.object({})))
  async getAnalysisStatus(
    @Param('listID') listID: number,
    @Req() request: RequestSchema
  ): Promise<ListAnalysisResponse> {
    const {
      user: { organizationId },
    } = requestSchema.parse(request);

    const analysisStatus = await this.listAnalysisService.getAnalysisStatus(organizationId, listID);
    return analysisStatus;
  }
}
