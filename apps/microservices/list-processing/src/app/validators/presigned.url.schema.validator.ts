import { ActionType, TargetListType } from '@wri-monorepos/sql';
import { z } from 'zod';

// Define the allowed content types
export const allowedContentTypes = [
  'application/geojson',
  'application/json',
  'application/vnd.google-earth.kml+xml',
  'application/vnd.google-earth.kmz',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/x-zip-compressed',
  'application/zip',
  'text/csv',
] as const;

// Define a Zod schema for the request body
export const getObjectPresignedSchema = z.object({
  key: z.string(),
  replaceFile: z.boolean().optional(),
});
export const requestPreSignedURLSchema = getObjectPresignedSchema.extend({
  contentType: z.enum(allowedContentTypes),
});

export const requestSaveLargeListProcessModelSchema = z.object({
  key: z.string(),
  userId: z.number(),
  list_id: z.number(),
  listName: z.string(),
  client_database: z.string(),
});
export const requestLargeListProcessSchema = z.object({
  organization_id: z.number(),
  subscription_status_id: z.number(),
  organization_database: z.string(),
  list_id: z.number().optional(),
  path: z.string(),
  user_id: z.number().optional(),
  startAnalysis: z.boolean().optional(),
  isExternalAPIProcess: z.boolean().optional(),
  list_name: z.string().optional(),
  analysisIds: z.array(z.string()).optional(),
  subscriptionStatusId: z.number().optional(),
  listStatusId: z.number().optional(),
  commodity: z.string(),
  saveAsDraft: z.boolean().optional(),
});

export const requestTriggerProcessLargeListSchema = z.object({
  list_name: z.string(),
  user_id: z.number(),
  client_database: z.string(),
  analysisIds: z.array(z.string()),
  commodity: z.string(),
  saveAsDraft: z.coerce.boolean(),
});

export const copyOrMoveLargeListRequestSchema = z.object({
  listId: z.coerce.number(),
  selectedListLocationClassification: z.string(),
  customAttributesNames: z.array(z.string()),
  userListNames: z.array(z.string()),
  action: z.nativeEnum(ActionType),
  listType: z.nativeEnum(TargetListType),
  listName: z.string(),
  targetList: z.any(),
  selectedLocations: z.array(z.coerce.number()),
  commodityType: z.string().optional(),
  saveAsDraft: z.coerce.boolean(),
  userId: z.coerce.number(),
  clientDatabase: z.string(),
  organizationId: z.coerce.number(),
  subscriptionStatusId: z.coerce.number(),
  gfwListId: z.coerce.number(),
  allLocationsSelected: z.coerce.boolean(),
  filters: z.any(),
  srcListAnalysisTable: z.string(),
});
export const getPaginatedListDataRequestSchema = z.object({
  listId: z.coerce.number(),
  organizationDatabase: z.string(),
  analysisAreaMax: z.coerce.number().optional(),
  analysisAreaMin: z.coerce.number().optional(),
  country: z.string().optional(),
  geometry: z.coerce.number().optional(),
  orderType: z.string().optional(),
  page: z.coerce.number().optional(),
  rowsPerPage: z.coerce.number().optional(),
  sortByAttribute: z.string().optional(),
  state: z.string().optional(),
  subState: z.string().optional(),
  locationLogic: z.string().optional(),
  locationIds: z.string().optional(),
  locationStatement: z.string().optional(),
  combinedColumns: z.string().optional(),
  searchString: z.string().optional(),
});

export const getNumberOfPagesPaginatedListDataRequestSchema = z.object({
  listId: z.coerce.number(),
  organizationDatabase: z.string(),
  subState: z.string().optional(),
  rowsPerPage: z.coerce.number(),
  analysisAreaMin: z.coerce.number().optional(),
  analysisAreaMax: z.coerce.number().optional(),
  searchString: z.string().optional(),
});
