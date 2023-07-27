import { ApiProperty } from '@nestjs/swagger';

export class CheckUserBelongToOrgDTO {
  @ApiProperty()
  email: string;
  @ApiProperty()
  organizationName: string;
}
