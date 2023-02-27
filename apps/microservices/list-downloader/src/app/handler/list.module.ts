import { Module } from '@nestjs/common';
import { PipeModule } from '../pipe/pipe.module';
import { ListMessageHandler } from './list.message.handler';

@Module({
  imports: [
    PipeModule
  ],
  providers: [
    ListMessageHandler,
  ],
  exports: [
    ListMessageHandler,
  ],
})
export class ListModule {

}
