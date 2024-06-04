import { z } from 'zod';

// Define the allowed content types
export const allowedContentTypes = [
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.google-earth.kml+xml',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

// Define a Zod schema for the request body
export const RequestPreSignedURLSchema = z.object({
  key: z.string(),
  contentType: z.enum(allowedContentTypes),
  replaceFile: z.boolean().optional(),
});
export const GetObjectPresignedSchema = z.object({
  key: z.string(),
  replaceFile: z.boolean().optional(),
});

export const RequestSaveLargeListProcessModelSchema = z.object({
  key: z.string(),
  userId: z.number(),
  list_id: z.number(),
  listName: z.string(),
  client_database: z.string(),
});
export const RequestLargeListProcessSchema = z.object({
  organization_id: z.number(),
  subscription_status_id: z.number(),
  organization_database: z.string(),
  list_id: z.number(),
  path: z.string(),
  template_type: z.string(),
  user_id: z.number(),
  startAnalysis: z.boolean(),
  isExternalAPIProcess: z.boolean().optional(),
});

export const RequestTriggerProcessLargeListSchema = z.object({
  list_name: z.string(),
  user_id: z.number(),
  client_database: z.string(),
  analysisIds: z.array(z.string()),
});

export const CopyOrMoveLargeListRequestSchema = z.object({
  source: z.string(),
  destination: z.string(),
  copy: z.boolean(),
});
export const getPaginatedListDataRequestSchema = z.object({
  page: z.number(),
  limit: z.number(),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
});

export const getNumberOfPagesPaginatedListDataRequestSchema = z.object({
  limit: z.number(),
  search: z.string().optional(),
});