import { ApiProperty } from '@nestjs/swagger';
export class CreateApiKeyRequest {
  @ApiProperty()
  organizationId: number;
  @ApiProperty()
  userId: number;
}
