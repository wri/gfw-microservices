import { Module } from '@nestjs/common';

import { PipeService } from './pipe.service';
import { InputService } from './input.service';
import { AwsModule } from '@wri-monorepos/aws';
import { SqlModule } from '@wri-monorepos/sql';
import { ShapefileService } from './shapefile.service';
import { ResultService } from './result.service';

@Module({
  imports: [
    AwsModule,
    SqlModule,
  ],
  providers: [
    PipeService,
    InputService,
    ShapefileService,
    ResultService,
  ],
  exports: [
    PipeService,
  ],
})
export class PipeModule {}
