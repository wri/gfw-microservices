import { HttpException, HttpStatus } from '@nestjs/common';
import { ListUploadNewErrorResponse } from '../list-upload-new.dto';

export function throwCustomErrorResponse(message: string, statusCode: HttpStatus) {
  const errorDescription = new ListUploadNewErrorResponse();
  errorDescription.errorDetails = message;
  throw new HttpException(errorDescription, statusCode);
}
