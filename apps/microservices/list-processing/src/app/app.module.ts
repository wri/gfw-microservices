import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { config } from 'aws-sdk';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from '../shared/database/gfw';
import { LargeListService } from './../services/largelist.service';

config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: DatabaseService }),
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    LargeListService,
  ],
})
export class AppModule {}
