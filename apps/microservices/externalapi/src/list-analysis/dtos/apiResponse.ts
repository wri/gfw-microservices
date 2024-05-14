import { ApiProperty } from '@nestjs/swagger';

const UNAUTHORIZED_ENUM = ['Unauthorized'];
const FORBIDDEN_ENUM = ['Forbidden'];
const NOT_FOUND_ENUM = ['Not Found'];
const BAD_REQUEST_ENUM = ['Bad Request'];
const DELETE_LIST_ENUM = ["User 'email@email' has deleted list (listName)"];
export class MessageResponse {
  @ApiProperty()
  message: string;
}
export class UnauthorizedResponse extends MessageResponse {
  @ApiProperty({ enum: UNAUTHORIZED_ENUM })
  message: string;
}
export class ForbiddenResponse extends MessageResponse {
  @ApiProperty({ enum: FORBIDDEN_ENUM })
  message: string;
}
export class NotFoundResponseString extends MessageResponse {
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

export class DeleteListMessageResponse extends MessageResponse {
  @ApiProperty({ enum: DELETE_LIST_ENUM })
  message: string;
}
