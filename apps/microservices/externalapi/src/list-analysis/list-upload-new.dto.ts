import { ApiProperty } from '@nestjs/swagger';
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

export class PrepareUploadRequest {
  @ApiProperty()
  userEmail: string;
}
