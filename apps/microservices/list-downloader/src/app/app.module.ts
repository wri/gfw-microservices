import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ConsumerModule } from './consumer/consumer.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmSystemModule } from '@wri-monorepos/sql';
import { PipeModule } from './pipe/pipe.module';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});
@Module({
  imports: [
    envModule,
    ConsumerModule,
    TypeOrmSystemModule.create({ name: 'default', imports: [PipeModule] }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
