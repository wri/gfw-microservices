import { Logger } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

export abstract class IFileGenerator {
  POOL_SIZE = 5;

  private readonly loggerPipe = new Logger(IFileGenerator.name);

  abstract makeFile(filters: GenerationFileRequest): Promise<void>;
}
