import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// Allow to load all the env variables before, change the way later
// we need to use ConfigService and inject in to needed modules
const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

import { ConsumerModule } from './consumer/consumer.module';
@Module({
  imports: [envModule, ConsumerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
