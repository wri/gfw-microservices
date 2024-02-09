import { Logger } from '@nestjs/common';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';

export abstract class IFileGenerator {
  private readonly loggerPipe = new Logger(IFileGenerator.name);

  abstract makeFile(filters: BasicFieldsFileRequest): Promise<void>;
}
