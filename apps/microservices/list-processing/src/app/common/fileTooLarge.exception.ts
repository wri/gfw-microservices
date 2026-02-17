import { HttpException, HttpStatus } from '@nestjs/common';

export const FILE_TOO_LARGE_ERROR = 'FileTooLarge';
export const FILE_TOO_LARGE_MESSAGE_PREFIX = 'Your file is too large';

export class FileTooLargeException extends HttpException {
  constructor(fileSizeInMB: string, maxSizeInMB = 128) {
    const message = `Your file is too large (${fileSizeInMB}MB). The maximum file size is ${maxSizeInMB}MB. Please reduce the number of locations or split your data into multiple files.`;
    super(
      {
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        error: FILE_TOO_LARGE_ERROR,
        message,
      },
      HttpStatus.PAYLOAD_TOO_LARGE
    );
  }
}
