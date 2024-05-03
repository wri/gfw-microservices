import { ApiProperty } from '@nestjs/swagger';

export class BadRequestExceptionResponse {
  @ApiProperty()
  message: string;
  @ApiProperty()
  error: string;
  @ApiProperty()
  statusCode: number;
}
