import { Logger, Controller, Post, Body, Scope, UsePipes } from '@nestjs/common';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { PipeService } from '../pipe/pipe.service';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { z } from 'zod';

export const BooleanStringZod = z.preprocess((val) => val === 'true', z.boolean()).default(false);

export const downloadRequest = z.object({
  file: z.string().optional(),
  listId: z.coerce.number(),
  key: z.string(),
  userEmail: z.string().optional(),
  type: z.string(),
  organizationDatabase: z.string(),
  isGFWList: BooleanStringZod,
  aggregation: BooleanStringZod,
  analysisArea: z.coerce.number().optional(),
  analysisAreaMax: z.coerce.number().optional(),
  analysisAreaMin: z.coerce.number().optional(),
  analysisAreaOperator: z.string().optional(),
  combinedColumns: z.string().optional(),
  country: z.string().optional(),
  geometry: z.number().optional(),
  listView: z.string().optional(),
  locationIds: z.string().optional(),
  locationLogic: z.string().optional(),
  locationStatement: z.string().optional(),
  orderType: z.string().optional(),
  searchString: z.string().optional(),
  selectedLocations: z.string().optional(),
  selectedMillPriority: z.string().optional(),
  selectedOverallThreats: z.string().optional(),
  selectedOverallValues: z.string().optional(),
  selectedParentCompany: z.string().optional(),
  selectedSecondSupplier: z.string().optional(),
  selectedSupplier: z.string().optional(),
  showRSPOCertified: BooleanStringZod,
  sortByAttribute: z.string().optional(),
  state: z.string().optional(),
  subState: z.string().optional(),
  templateId: z.number().optional(),
  selectedTimeframe: z.string().optional(),
  selectedAlert: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

@Controller({
  path: 'list',
  scope: Scope.REQUEST,
})
export class ListMessageController {
  private readonly logger = new Logger(ListMessageController.name);

  constructor(private readonly pipeService: PipeService) {}

  @Post('download')
  @UsePipes(new ZodValidationPipe(downloadRequest))
  async download(@Body() body: BasicFieldsFileRequest) {
    this.logger.log('List message received', body);
    this.pipeService.makeFile(body);
    return body;
  }
}
