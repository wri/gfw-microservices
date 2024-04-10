import { ConfigModule } from '@nestjs/config';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

import { Module } from '@nestjs/common';
import { config } from 'aws-sdk';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LargeListService } from './../services/largelist.service';
import { GeoService, LocationService } from '@wri-monorepos/geo';
import { SqlModule, TypeOrmSystemModule } from '@wri-monorepos/sql';
import { ListService } from '../services/list.service';
import { FCDModule } from './fcd';
import { SchedulerModule } from './scheduler';
import { AFIModule } from './afi';
import { AlertsModule } from './alerts';
import { ListUploadModule } from './list-upload';

config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

@Module({
  imports: [
    envModule,
    TypeOrmSystemModule.create({
      name: 'default',
      imports: [SchedulerModule],
    }),
    SqlModule,
    FCDModule,
    AFIModule,
    SchedulerModule,
    AlertsModule,
    ListUploadModule,
  ],
  controllers: [AppController],
  providers: [AppService, LargeListService, LocationService, GeoService, ListService],
})
export class AppModule {}
