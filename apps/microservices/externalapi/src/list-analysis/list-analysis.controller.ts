import { Controller, Get, Post, Param, Req, Body } from '@nestjs/common';
import { ListAnalysisResponse } from './list-analysis.dto';
import { ListAnalysisService } from './list-analysis.service';
import { ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { requestSchema, RequestSchema } from '../types/request-schema';
import { z } from 'zod';
import { ZodValidationPipe } from '../middleware/zod.middleware';

const listIdSchema = z.coerce.number();
const analysisIdSchema = z.enum(['ALERTS', 'FCD']);

const alertsGenerateBodySchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  selectedTimeFrame: z.enum(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR']).default('DAY'),
  selectedAlert: z.enum(['GLAD', 'VIIRS']).default('GLAD'),
  userEmail: z.string().email(),
});

export type AlertsGenerateBodySchema = z.infer<typeof alertsGenerateBodySchema>;

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

  @ApiResponse({ type: ListAnalysisResponse })
  @Post(':listId/analysis/ALERTS/generate')
  async createAnalysisStatus(
    @Param('listId', new ZodValidationPipe(listIdSchema)) listId: number,
    @Body(new ZodValidationPipe(alertsGenerateBodySchema)) alertsGenerate: AlertsGenerateBodySchema,
    @Req() request: RequestSchema
  ) {
    new ZodValidationPipe(requestSchema).transform(request);

    const {
      user: { organizationId },
    } = request;

    const { startDate, endDate, selectedAlert, selectedTimeFrame, userEmail } = alertsGenerate;

    await this.listAnalysisService.generateAlert({
      organizationId,
      startDate,
      endDate,
      listId,
      selectedAlert,
      selectedTimeFrame,
      userEmail,
    });
  }
}
