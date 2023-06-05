import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ConsumerModule } from './consumer/consumer.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});
@Module({
  imports: [envModule, ConsumerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
