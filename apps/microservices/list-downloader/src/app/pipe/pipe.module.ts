import { Module } from '@nestjs/common';

import { PipeService } from './pipe.service';
import { InputService } from './input.service';
import { AwsModule } from '@wri-monorepos/aws';
import { SqlModule } from '@wri-monorepos/sql';
import { ShapefileService } from './shapefile.service';
import { ResultService } from './result.service';
import { ForestLossService } from './forest.loss.service';

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
    ForestLossService
  ],
  exports: [
    PipeService,
  ],
})
export class PipeModule {}
