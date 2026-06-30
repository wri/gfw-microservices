import { AlertsTimeframes } from '@wri-monorepos/sql';
import { z } from 'zod';

export enum CSVInputTypes {
  AFI = 'afi',
  ALERTS = 'alerts',
  ACCOUNTUSERSUSAGE = 'accountUsersUsage',
  ARGENTINAOVERLAP = 'argentinaOverlap',
  ARGENTINA = 'argentina',
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
  AFIVC = 'afiVC',
  GHG = 'ghg',
  PROMANAGERUSERS = 'proManagerUsers',
}

export const BooleanStringZod = z.preprocess((val) => val === 'true', z.boolean()).default(false);

export const CommonRequestSchema = z.object({
  file: z.string().trim().optional().describe('File path or identifier'),
  key: z.string().trim().optional().describe('API key or access token'),
  userEmail: z.string().trim().email().optional().describe('Email address of the requesting user'),
  type: z.nativeEnum(CSVInputTypes).describe('Type of CSV input being processed'),
  organizationDatabase: z
    .string()
    .trim()
    .optional()
    .describe('Database identifier for the organization'),
});

export const BasicFieldsFileRequestSchema = CommonRequestSchema.extend({
  listId: z.coerce.number().int().positive().describe('Unique identifier for the list'),
  isGFWList: BooleanStringZod.describe('Whether this is a GFW list'),
});

export const AlertFieldsFileRequestSchema = BasicFieldsFileRequestSchema.extend({
  selectedTimeframe: z.nativeEnum(AlertsTimeframes).describe('Selected timeframe for alerts'),
  selectedAlert: z.string().trim().min(1).describe('Selected alert identifier'),
  startDate: z.string().datetime().optional().describe('Start date for alert range'),
  endDate: z.string().datetime().optional().describe('End date for alert range'),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['startDate'],
  }
);

export const ListFieldsFileRequestSchema = BasicFieldsFileRequestSchema.extend({
  aggregation: BooleanStringZod,
  analysisArea: z.string().trim().optional(),
  analysisAreaMin: z.string().trim().optional(),
  analysisAreaOperator: z.string().trim().optional(),
  combinedColumns: z.string().trim().optional(),
  country: z.string().trim().optional(),
  geometry: z.number().positive().optional(),
  listLevelAnalysis: z
    .object({
      country_area: z.string().trim().optional(),
      protected_areas_by_category_area: z.string().trim().optional(),
      landmark_by_category_area: z.string().trim().optional(),
      listId: z.number().int().positive().optional(),
      listName: z.string().trim().optional(),
      key: z.string().trim().optional(),
      type: z.string().trim().optional(),
      listView: z.string().trim().optional(),
      selectedLocationsList: z.string().trim().optional(),
    })
    .optional(),
  listView: z.string().trim().optional(),
  locationIds: z.string().trim().optional(),
  locationLogic: z.string().trim().optional(),
  locationStatement: z.string().trim().optional(),
  orderType: z.string().trim().optional(),
  searchString: z.string().trim().optional(),
  selectedLocations: z.string().trim().optional(),
  selectedMillPriority: z.string().trim().optional(),
  selectedOverallThreats: z.string().trim().optional(),
  selectedOverallValues: z.string().trim().optional(),
  selectedParentCompany: z.string().trim().optional(),
  selectedSecondSupplier: z.string().trim().optional(),
  selectedSupplier: z.string().trim().optional(),
  showRSPOCertified: BooleanStringZod,
  sortByAttribute: z.string().trim().optional(),
  state: z.string().trim().optional(),
  subState: z.string().trim().optional(),
});

export const AccountUsersUsageRequestSchema = CommonRequestSchema.extend({
  startDate: z.string().trim().date().optional(),
  endDate: z.string().trim().date().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['startDate'],
  }
);

export const ProManagerUsersExportRequestSchema = CommonRequestSchema.extend({
  key: z.string().trim().min(1).describe('File name/key for the generated export'),
  userEmail: z.string().trim().email().describe('Email address of the requesting user'),
});

export const getSchemaByType = (type: string) => {
  switch (type) {
    case CSVInputTypes.AFI:
    case CSVInputTypes.AFIVC:
    case CSVInputTypes.GHG:
      return BasicFieldsFileRequestSchema;
    case CSVInputTypes.ALERTS:
      return AlertFieldsFileRequestSchema;
    case CSVInputTypes.ACCOUNTUSERSUSAGE:
      return AccountUsersUsageRequestSchema;
    case CSVInputTypes.PROMANAGERUSERS:
      // System-wide users export: needs the common fields plus a required key (file name)
      // and userEmail, which the generator relies on to name the file and email the link.
      return ProManagerUsersExportRequestSchema;
    case CSVInputTypes.ARGENTINA:
    case CSVInputTypes.COLOMBIA:
    case CSVInputTypes.COMMODITYRISKDIAGNOSTICLOCATIONSUMMARY:
    case CSVInputTypes.DEFORESTATIONTRENDS:
    case CSVInputTypes.EVERYTHING:
    case CSVInputTypes.FORESTCHANGEDIAGNOSTICLISTSUMMARY:
    case CSVInputTypes.FORESTCHANGEDIAGNOSTICLOCATIONSUMMARY:
    case CSVInputTypes.FORESTLOSS:
    case CSVInputTypes.HISTORICPERCENT:
    case CSVInputTypes.INPUT:
    case CSVInputTypes.MILLPRIORITY:
    case CSVInputTypes.PALMRISKANALYSIS:
    case CSVInputTypes.RESULTS:
    case CSVInputTypes.SOUTHAMERICAOVERLAP:
    case CSVInputTypes.SOUTHAMERICATCL:
    case CSVInputTypes.SOUTHEASTASIAOVERLAP:
    case CSVInputTypes.SOUTHEASTASIATC:
      return ListFieldsFileRequestSchema;
    default:
      return BasicFieldsFileRequestSchema;
  }
};
