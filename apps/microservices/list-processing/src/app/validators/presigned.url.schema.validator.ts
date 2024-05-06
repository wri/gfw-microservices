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
