import { ApiProperty } from '@nestjs/swagger';
export class ViewApiKeyResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  apiKey: string;
  @ApiProperty()
  apiGroup: string;
  @ApiProperty()
  creatorUserEmail: string;
  @ApiProperty()
  organizationId: number;
  @ApiProperty()
  creationDate: Date;
}
