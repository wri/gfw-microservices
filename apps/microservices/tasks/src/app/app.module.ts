import { Module } from '@nestjs/common';
import { ConsumerModule } from './consumer/consumer.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConsumerModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
