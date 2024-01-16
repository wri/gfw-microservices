import { Logger } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { IFileGenerator } from './i.file.generator';

export class AlertsGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(AlertsGeneratorService.name);

  constructor() {
    super();
  }

  makeFile(filters: GenerationFileRequest): Promise<void> {
    console.log(filters);
    return new Promise((resolve) => {
      resolve();
    });
  }
}
