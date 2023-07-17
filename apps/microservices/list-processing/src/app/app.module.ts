import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

import { Module } from '@nestjs/common';
import { config } from 'aws-sdk';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from '../shared/database/gfw';
import { LargeListService } from './../services/largelist.service';
import { GeoService, LocationService } from '@wri-monorepos/geo';
import { SqlModule } from '@wri-monorepos/sql';
import { ListService } from '../services/list.service';

config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

@Module({
  imports: [envModule, TypeOrmModule.forRootAsync({ useClass: DatabaseService }), SqlModule],
  controllers: [AppController],
  providers: [AppService, LargeListService, LocationService, GeoService, ListService],
})
export class AppModule {}
