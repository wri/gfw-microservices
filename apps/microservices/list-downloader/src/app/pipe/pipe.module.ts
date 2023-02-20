import { Module } from '@nestjs/common';

import { PipeService } from './pipe.service';
import { InputService } from './input.service';
import { AwsModule } from '@wri-monorepos/aws';
import { SqlModule } from '@wri-monorepos/sql';

@Module({
  imports: [
    AwsModule,
    SqlModule,
  ],
  providers: [
    PipeService,
    InputService,
  ],
  exports: [
    PipeService,
  ],
})
export class PipeModule {}
