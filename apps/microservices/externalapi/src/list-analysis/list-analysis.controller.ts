import { Controller, Get, Param, Req } from '@nestjs/common';
import { ListAnalysisResponse } from './list-analysis.dto';
import { ListAnalysisService } from './list-analysis.service';
import { ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { requestSchema, RequestSchema } from '../types/request-schema';
import { z } from 'zod';

const listAnalysisParamListIdSchema = z.number();

@ApiSecurity('x-api-key')
@Controller('/v1/list')
export class ListAnalysisController {
  constructor(private readonly listAnalysisService: ListAnalysisService) {}

  @ApiResponse({ status: 200, type: ListAnalysisResponse })
  @Get(':listID/analysis/FCD/status')
  async getAnalysisStatus(
    @Param('listID') listID: number,
    @Req() request: RequestSchema
  ): Promise<ListAnalysisResponse> {
    const {
      user: { organizationId },
    } = requestSchema.parse(request);

    const id = Number(listID);
    listAnalysisParamListIdSchema.parse(id);

    const analysisStatus = await this.listAnalysisService.getAnalysisStatus(organizationId, listID);
    return analysisStatus;
  }
}
