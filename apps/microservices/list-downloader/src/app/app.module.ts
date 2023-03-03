import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ConsumerModule } from './consumer/consumer.module';
const envModule = ConfigModule.forRoot({
  isGlobal: true,
});
@Module({
  imports: [envModule, ConsumerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
