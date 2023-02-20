import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ConsumerModule } from './consumer/consumer.module';;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ConsumerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
