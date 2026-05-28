import { BadRequestException } from '@nestjs/common';

export const EMPTY_DATA_FILE_ERROR = 'Empty data file';
export const EMPTY_DATA_FILE_MESSAGE = 'Validation errors found in the data';

export class EmptyDataFileException extends BadRequestException {
  constructor() {
    super({
      message: EMPTY_DATA_FILE_MESSAGE,
      errors: [EMPTY_DATA_FILE_ERROR],
    });
  }
}
