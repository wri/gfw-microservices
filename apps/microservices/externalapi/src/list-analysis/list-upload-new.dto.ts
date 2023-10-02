import { ApiProperty } from '@nestjs/swagger';
export class ListUploadNewRequest {
  @ApiProperty()
  uploadId: string;
  @ApiProperty()
  listName: string;
  @ApiProperty()
  templateId: string;
  @ApiProperty()
  analysisIDs: string;
}

export class ListUploadNewResponse {
  @ApiProperty()
  uploadId: string;
  @ApiProperty()
  listId: string;
  @ApiProperty()
  status: 'Processing' | 'Completed' | 'Failed';
  @ApiProperty()
  errorDetails: string;
  @ApiProperty()
  creationDate: string;
}

export class ListUploadNewErrorResponse {
  @ApiProperty()
  errorDetails: string;
}

export class PrepareUploadRequest {
  @ApiProperty()
  userEmail: string;
}
