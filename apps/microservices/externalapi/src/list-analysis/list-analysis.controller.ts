import { Controller, Get, Param, Req } from '@nestjs/common';
import { ListAnalysisResponse } from './list-analysis.dto';
import { ListAnalysisService } from './list-analysis.service';
import { ApiResponse } from '@nestjs/swagger';

@Controller('/v1/list')
export class ListAnalysisController {
  constructor(private readonly listAnalysisService: ListAnalysisService) {}

  @ApiResponse({ status: 200, type: ListAnalysisResponse })
  @Get(':listID/analysis/FCD/status')
  async getAnalysisStatus(
    @Param('listID') listID: string,
    @Req() request: Request
  ): Promise<ListAnalysisResponse> {
    const apiKey = request.headers['x-api-key'];
    console.log(apiKey);
    // Lookup orgID and orgDB using apiKey (implement this logic)

    // Check if the given list exists and get status (implement this logic)
    const analysisStatus = await this.listAnalysisService.getAnalysisStatus(listID);

    return analysisStatus;
  }
}
