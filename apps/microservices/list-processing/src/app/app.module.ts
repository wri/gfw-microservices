import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { config as awsConfig } from 'aws-sdk';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeleteListTypeOrm, SqlModule, TypeOrmSystemModule } from '@wri-monorepos/sql';
import { LocationService } from '../services/locations.service';
import { ListService } from '../services/list.service';
import { LockListService } from '../services/lock.list.service';
import { GeoService } from '@wri-monorepos/geo';
import { ListPaginationService } from '../services/list.pagination.service';
import { FCDModule } from './fcd';
import { SchedulerModule } from './scheduler';
import { AFIModule } from './afi';
import { AlertsModule } from './alerts';
import { ListUploadModule } from './list-upload';
import { ListController } from './v1/list.controller';
import { ServerConfigType, serverConfigSchema } from '../../validators/server-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.production'],
      validate: (env) => serverConfigSchema.parse(env),
      isGlobal: true,
    }),
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
  controllers: [AppController, ListController],
  providers: [
    AppService,
    ListPaginationService,
    LocationService,
    GeoService,
    ListService,
    LockListService,
    DeleteListTypeOrm,
    {
      provide: '',
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ServerConfigType, true>) => {
        awsConfig.update({
          accessKeyId: configService.get('AWS_ACCESS_KEY_ID', { infer: true }),
          secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY', { infer: true }),
          region: configService.get('AWS_REGION', { infer: true }),
        });
      },
    },
  ],
})
export class AppModule {}
