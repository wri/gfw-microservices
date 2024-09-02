import { Module } from '@nestjs/common';
import { PipeModule } from '../pipe/pipe.module';
import { ListMessageController } from './list.message.controller';

@Module({
  imports: [PipeModule],
  controllers: [ListMessageController],
  exports: [],
})
export class ListModule {}
