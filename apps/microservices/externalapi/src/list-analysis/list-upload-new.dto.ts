import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

const analysisIdsMap = {
  Alerts: 'ALERTS',
  FCD: 'FCD',
  DefReport: 'AFI',
};

const analysisIdsInputArray = Object.keys(analysisIdsMap) as [string];

export const listUploadNewRequestSchema = z.object({
  uploadId: z.string(),
  listName: z.string(),
  templateId: z.number(),
  analysisIDs: z
    .string()
    .transform((x) => Array.from(new Set(x.replace(/ /g, '').split(','))))
    .pipe(z.array(z.enum(analysisIdsInputArray).transform((x) => analysisIdsMap[x]))),
});

export type ListUploadNewRequestSchema = z.infer<typeof listUploadNewRequestSchema>;
export class ListUploadNewRequest {
  @ApiProperty()
  uploadId: string;
  @ApiProperty()
  listName: string;
  @ApiProperty()
  templateId: number;
  @ApiProperty()
  analysisIDs: string;
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
  fileType: z.enum(['csv', 'xlsx', 'zip']),
});

export type PrepareUploadRequestSchema = z.infer<typeof prepareUploadRequestSchema>;

export class PrepareUploadRequest {
  @ApiProperty()
  userEmail: string;
  @ApiProperty()
  fileType: string;
}
