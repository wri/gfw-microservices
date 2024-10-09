import {
  Logger,
  Controller,
  Post,
  Body,
  Scope,
  UsePipes,
  Injectable,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import {
  AlertsTimeframes,
  BasicFieldsFileRequest,
  ListFieldsFileRequest,
} from '@wri-monorepos/sql';
import { PipeService } from '../pipe/pipe.service';
import { z } from 'zod';

export const BooleanStringZod = z.preprocess((val) => val === 'true', z.boolean()).default(false);

export enum CSVInputTypes {
  AFI = 'afi',
  ALERTS = 'alerts',
  ACCOUNTUSERSUSAGE = 'accountUsersUsage',
  ARGENTINAOVERLAP = 'argentinaOverlap',
  ARGENTINADEFORESTATION = 'argentinaDeforestation',
  COLOMBIA = 'colombia',
  COMMODITYRISKDIAGNOSTICLOCATIONSUMMARY = 'commodityRiskDiagnosticLocationSummary',
  DEFORESTATIONTRENDS = 'deforestationTrends',
  EVERYTHING = 'everything',
  FORESTCHANGEDIAGNOSTICLISTSUMMARY = 'forestChangeDiagnosticListSummary',
  FORESTCHANGEDIAGNOSTICLOCATIONSUMMARY = 'forestChangeDiagnosticLocationSummary',
  FORESTLOSS = 'forestLoss',
  HISTORICPERCENT = 'historicPercent',
  INPUT = 'input',
  MILLPRIORITY = 'millPriority',
  PALMRISKANALYSIS = 'palmRiskAnalysis',
  RESULTS = 'results',
  SOUTHAMERICAOVERLAP = 'southAmericaOverlap',
  SOUTHAMERICATCL = 'southAmericaTCL',
  SOUTHEASTASIAOVERLAP = 'southEastAsiaOverlap',
  SOUTHEASTASIATC = 'southEastAsiaTCL',
  AFIVC = 'afi-vc',
}

// BasicFieldsFileRequest schema
const BasicFieldsFileRequestSchema = z.object({
  file: z.string().optional(),
  listId: z.coerce.number(),
  key: z.string().optional(),
  userEmail: z.string().optional(),
  type: z.nativeEnum(CSVInputTypes),
  organizationDatabase: z.string().optional(),
  isGFWList: BooleanStringZod,
});

// AlertFieldsFileRequest schema
const AlertFieldsFileRequestSchema = BasicFieldsFileRequestSchema.extend({
  selectedTimeframe: z.nativeEnum(AlertsTimeframes),
  selectedAlert: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ListFieldsFileRequestSchema schema
const ListFieldsFileRequestSchema = BasicFieldsFileRequestSchema.extend({
  aggregation: BooleanStringZod,
  analysisArea: z.string().optional(),
  analysisAreaMax: z.string().optional(),
  analysisAreaMin: z.string().optional(),
  analysisAreaOperator: z.string().optional(),
  combinedColumns: z.string().optional(),
  country: z.string().optional(),
  geometry: z.number().optional(),
  listLevelAnalysis: z
    .object({
      country_area: z.string().optional(),
      arg_otbn_area: z.string().optional(),
      protected_areas_by_category_area: z.string().optional(),
      landmark_by_category_area: z.string().optional(),
      listId: z.number().optional(),
      listName: z.string().optional(),
      key: z.string().optional(),
      type: z.string().optional(),
      listView: z.string().optional(),
      selectedLocationsList: z.string().optional(),
    })
    .optional(),
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
});

// AccountUsersUsageRequest schema
const AccountUsersUsageRequestSchema = BasicFieldsFileRequestSchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Function to get the appropriate schema based on the type
const getSchemaByType = (type: string) => {
  switch (type) {
    case 'afi':
    case 'afi-vc':
      return BasicFieldsFileRequestSchema;
    case 'alerts':
      return AlertFieldsFileRequestSchema;
    case 'accountUsersUsage':
      return AccountUsersUsageRequestSchema;
    case 'argentinaOverlap':
    case 'argentinaDeforestation':
    case 'colombia':
    case 'commodityRiskDiagnosticLocationSummary':
    case 'deforestationTrends':
    case 'everything':
    case 'forestChangeDiagnosticListSummary':
    case 'forestChangeDiagnosticLocationSummary':
    case 'forestLoss':
    case 'historicPercent':
    case 'input':
    case 'millPriority':
    case 'palmRiskAnalysis':
    case 'results':
    case 'southAmericaOverlap':
    case 'southAmericaTCL':
    case 'southEastAsiaOverlap':
    case 'southEastAsiaTCL':
      return ListFieldsFileRequestSchema;
    default:
      return BasicFieldsFileRequestSchema;
  }
};

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: BasicFieldsFileRequest) {
    const schema = getSchemaByType(value.type);
    try {
      return schema.parse(value);
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }
}

@Controller({
  path: 'list',
  scope: Scope.REQUEST,
})
export class ListMessageController {
  private readonly logger = new Logger(ListMessageController.name);

  constructor(private readonly pipeService: PipeService) {}

  @Post('download')
  @UsePipes(ZodValidationPipe)
  async download(@Body() body: BasicFieldsFileRequest) {
    this.logger.log('List message received', body);
    this.pipeService.makeFile(body);
    return body;
  }
}
