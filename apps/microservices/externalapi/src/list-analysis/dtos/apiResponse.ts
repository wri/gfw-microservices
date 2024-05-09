import { ApiProperty } from '@nestjs/swagger';

const UNAUTHORIZED_ENUM = ['Unauthorized'];
const FORBIDDEN_ENUM = ['Forbidden'];
const NOT_FOUND_ENUM = ['Not Found'];
const BAD_REQUEST_ENUM = ['Bad Request'];
export class UnauthorizedResponse {
  @ApiProperty()
  @ApiProperty({ enum: UNAUTHORIZED_ENUM })
  message: string;
}
export class ForbiddenResponse {
  @ApiProperty({ enum: FORBIDDEN_ENUM })
  message: string;
}
export class NotFoundResponseString {
  @ApiProperty({ enum: NOT_FOUND_ENUM })
  message: string;
}
export class NotFoundResponse extends NotFoundResponseString {
  @ApiProperty()
  statusCode: number;
}
export class BadRequestResponse {
  @ApiProperty({ enum: BAD_REQUEST_ENUM })
  message: string;
}

export class ErroResponseWithErroMessage extends NotFoundResponse {
  @ApiProperty()
  error: string;
}
