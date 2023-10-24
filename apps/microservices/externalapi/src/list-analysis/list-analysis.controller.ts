import { Controller, Get, Param, Req } from '@nestjs/common';
import { ListAnalysisResponse } from './list-analysis.dto';
import { ListAnalysisService } from './list-analysis.service';
import { ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { Request } from 'express';

@ApiSecurity('x-api-key')
@Controller('/v1/list')
export class ListAnalysisController {
  constructor(private readonly listAnalysisService: ListAnalysisService) {}

  @ApiResponse({ status: 200, type: ListAnalysisResponse })
  @Get(':listID/analysis/FCD/status')
  async getAnalysisStatus(
    @Param('listID') listID: number,
    @Req() request: Request
  ): Promise<ListAnalysisResponse> {
    const organizationId = request.user.organizationId ?? 0;

    const analysisStatus = await this.listAnalysisService.getAnalysisStatus(organizationId, listID);
    return analysisStatus;
  }
}
