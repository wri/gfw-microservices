import { HttpException, HttpStatus } from '@nestjs/common';

export class ProcessingLimitException extends HttpException {
  constructor() {
    super(
      {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Error POST /process-list: Unprocessable entity. Processing limit reached.',
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
      {
        cause: new Error(),
        description: 'You have reached your list processing limits',
      }
    );
  }
}
