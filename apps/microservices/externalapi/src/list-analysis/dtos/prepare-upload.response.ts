import { ApiProperty } from '@nestjs/swagger';

export class PrepareUploadResponse {
  @ApiProperty()
  uploadId: string;

  @ApiProperty()
  uploadUrl: string;

  @ApiProperty()
  uploadDateTime: Date;
}
