import { Module } from '@nestjs/common';

import { LLPMessageHandler } from './llp.message.handler';
import { ShapeFileService } from './shapefile.service';
import { CSVService } from './csv.service';
import { CreateFileService } from './create.file.service';

@Module({
  controllers: [

  ],
  providers: [
    CreateFileService,
    CSVService,
    LLPMessageHandler,
    ShapeFileService,
  ],
  exports: [
    LLPMessageHandler
  ],
})
export class LLPModule {}