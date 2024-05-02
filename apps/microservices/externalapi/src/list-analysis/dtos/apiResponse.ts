import { ApiProperty } from '@nestjs/swagger';

const unauthorizedEnum = ['Unauthorized'];
const forbiddenEnum = ['Forbidden'];
const notFoundEnum = ['Not Found'];
const BadRequestEnum = ['Bad Request'];
export class UnauthorizedResponse {
  @ApiProperty()
  @ApiProperty({ enum: unauthorizedEnum })
  message: string;
}
export class ForbiddenResponse {
  @ApiProperty({ enum: forbiddenEnum })
  message: string;
}
export class NotFoundResponse {
  @ApiProperty({ enum: notFoundEnum })
  message: string;
}
export class BadRequestResponse {
  @ApiProperty({ enum: BadRequestEnum })
  message: string;
}
