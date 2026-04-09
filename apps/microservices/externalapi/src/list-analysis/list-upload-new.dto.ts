import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { analysisIdsCsvSchema } from '../types/analysis-id';

export const listUploadNewRequestSchema = z.object({
  uploadId: z.string(),
  listName: z.string(),
  analysisIDs: analysisIdsCsvSchema,
  commodity: z.string().max(150),
  options: z.string().optional(),
});

export type ListUploadNewRequestSchema = z.infer<typeof listUploadNewRequestSchema>;
export class ListUploadNewRequest {
  @ApiProperty()
  uploadId: string;
  @ApiProperty()
  listName: string;
  @ApiProperty()
  analysisIDs: string;
  @ApiProperty()
  commodity: string;
  @ApiProperty({ required: false })
  options?: string;
}

export class ListUploadNewResponse {
  @ApiProperty()
  uploadId: string;
  @ApiProperty()
  listId: string;
  @ApiProperty()
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  @ApiProperty()
  errorDetails: string;
  @ApiProperty()
  creationDate: Date;
}

export class ListUploadNewErrorResponse {
  @ApiProperty()
  errorDetails: string;
}

export const prepareUploadRequestSchema = z.object({
  userEmail: z.string().email(),
  fileType: z.enum(['csv', 'xlsx', 'zip', 'kml', 'kmz', 'json', 'geojson']),
});

export type PrepareUploadRequestSchema = z.infer<typeof prepareUploadRequestSchema>;

export class PrepareUploadRequest {
  @ApiProperty()
  userEmail: string;
  @ApiProperty()
  fileType: string;
}

export class ListInfoResponse {
  @ApiProperty()
  listId: number;
  @ApiProperty()
  listName: string;
  @ApiProperty()
  locationCount: number;
  @ApiProperty()
  analysisIDs: string;
  @ApiProperty({ required: false })
  options?: string;
}
