import { HttpException, HttpStatus } from '@nestjs/common';

export class ListSizeLimitException extends HttpException {
  constructor(limit) {
    super(
      {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        error: `ListTooLarge`,
        message: `List exceeds the maximum allowed size of ${limit} locations.`,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
      {}
    );
  }
}
